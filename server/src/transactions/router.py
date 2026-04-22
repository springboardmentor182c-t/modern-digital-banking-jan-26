from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import csv
import io
from datetime import datetime

from src.database import get_db
from src.auth.router import get_current_user
from src.auth.models import User
from src.transactions.models import Transaction, TransactionType
from src.transactions.schemas import TransactionCreate, TransactionResponse, TransactionUpdate
from src.accounts.models import Account

router = APIRouter()

@router.post("", response_model=TransactionResponse)
async def create_transaction(
    txn: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify account belongs to user
    result = await db.execute(
        select(Account).filter(Account.id == txn.account_id, Account.user_id == current_user.id)
    )
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    new_txn = Transaction(**txn.model_dump())
    
    # Update account balance
    if txn.txn_type == TransactionType.credit:
        account.balance += txn.amount
    else:
        account.balance -= txn.amount
        
    db.add(new_txn)
    await db.commit()
    await db.refresh(new_txn)
    return new_txn

@router.put("/{txn_id}", response_model=TransactionResponse)
async def update_transaction(
    txn_id: int,
    txn_update: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify transaction belongs to user (via account)
    result = await db.execute(
        select(Transaction)
        .join(Account)
        .filter(Transaction.id == txn_id, Account.user_id == current_user.id)
    )
    txn = result.scalars().first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    # If amount or type is changing, we need to adjust the account balance
    update_data = txn_update.model_dump(exclude_unset=True)
    if 'amount' in update_data or 'txn_type' in update_data:
        # Get the account
        account_result = await db.execute(select(Account).filter(Account.id == txn.account_id))
        account = account_result.scalars().first()
        
        # Revert old transaction effect
        if txn.txn_type == TransactionType.credit:
            account.balance -= txn.amount
        else:
            account.balance += txn.amount
            
        # Apply new transaction effect
        new_amount = update_data.get('amount', txn.amount)
        new_type = update_data.get('txn_type', txn.txn_type)
        if new_type == TransactionType.credit:
            account.balance += new_amount
        else:
            account.balance -= new_amount

    # If the user changed the account_id, make sure the new one is valid
    if 'account_id' in update_data and update_data['account_id'] != txn.account_id:
        acc_result = await db.execute(
             select(Account).filter(Account.id == update_data['account_id'], Account.user_id == current_user.id)
        )
        if not acc_result.scalars().first():
             raise HTTPException(status_code=404, detail="New account not found")

    for key, value in update_data.items():
        setattr(txn, key, value)
        
    await db.commit()
    await db.refresh(txn)
    return txn

@router.delete("/{txn_id}", status_code=204)
async def delete_transaction(
    txn_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify transaction belongs to user (via account)
    result = await db.execute(
        select(Transaction)
        .join(Account)
        .filter(Transaction.id == txn_id, Account.user_id == current_user.id)
    )
    txn = result.scalars().first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    # Revert account balance
    account_result = await db.execute(select(Account).filter(Account.id == txn.account_id))
    account = account_result.scalars().first()
    
    if txn.txn_type == TransactionType.credit:
        account.balance -= txn.amount
    else:
        account.balance += txn.amount
        
    await db.delete(txn)
    await db.commit()
    return None

@router.get("", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Join with accounts to filter by user and limit to 5
    result = await db.execute(
        select(Transaction)
        .join(Account)
        .filter(Account.user_id == current_user.id)
        .order_by(Transaction.txn_date.desc())
        .limit(5)
    )
    return result.scalars().all()

@router.post("/import")
async def import_transactions(
    account_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    # Verify account belongs to user
    result = await db.execute(
        select(Account).filter(Account.id == account_id, Account.user_id == current_user.id)
    )
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    imported_count = 0
    # Expected columns: Date, Description, Category, Amount, Type, Merchant
    # Mapping to db model: txn_date, description, category, amount, txn_type, merchant
    for row in reader:
        # Standardize headers by stripping whitespace and lowercasing
        clean_row = {k.strip().lower(): v.strip() for k, v in row.items()}
        
        try:
            date_val = clean_row.get('date')
            try:
                txn_date = datetime.fromisoformat(date_val) if date_val else datetime.utcnow()
            except ValueError:
                # fallback for other formats if any, or just utcnow
                txn_date = datetime.utcnow()

            amount_val = float(clean_row.get('amount', 0))
            txn_type_str = clean_row.get('type', 'debit').lower()
            
            if txn_type_str not in ['credit', 'debit']:
                txn_type_str = 'debit'

            new_txn = Transaction(
                account_id=account.id,
                description=clean_row.get('description', 'Imported Transaction'),
                category=clean_row.get('category', 'Uncategorized'),
                amount=amount_val,
                currency='INR',
                txn_type=TransactionType[txn_type_str],
                merchant=clean_row.get('merchant', ''),
                txn_date=txn_date
            )
            
            if new_txn.txn_type == TransactionType.credit:
                account.balance += new_txn.amount
            else:
                account.balance -= new_txn.amount
                
            db.add(new_txn)
            imported_count += 1
        except Exception as e:
            # Skip invalid rows or log them
            continue
            
    await db.commit()
    return {"message": f"Successfully imported {imported_count} transactions"}
