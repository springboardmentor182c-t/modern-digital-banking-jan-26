from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from src.database.core import SessionLocal
from src.models.user import Account, User, Transaction
from src.schemas import AccountCreateSchema, AccountUpdateSchema, AccountResponseSchema
from src.auth.service import get_current_user_from_token as get_current_user
from decimal import Decimal
from datetime import datetime, date
from pydantic import BaseModel
import csv
import io

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[AccountResponseSchema])
def list_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return all accounts for the logged-in user"""
    accounts = db.query(Account).filter_by(user_id=current_user.id).all()
    return [
        {
            "id": acc.id,
            "bank_name": acc.bank_name,
            "account_name": acc.account_name,
            "account_number": acc.account_number,
            "account_type": acc.account_type,
            "currency": acc.currency,
            "balance": float(acc.balance) if acc.balance else 0.0,
            "status": acc.status
        }
        for acc in accounts
    ]


@router.get("/{account_id}", response_model=AccountResponseSchema)
def get_account(account_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return single account details"""
    account = db.query(Account).filter_by(id=account_id, user_id=current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return {
        "id": account.id,
        "bank_name": account.bank_name,
        "account_name": account.account_name,
        "account_number": account.account_number,
        "account_type": account.account_type,
        "currency": account.currency,
        "balance": float(account.balance) if account.balance else 0.0,
        "status": account.status
    }


@router.post("/", response_model=AccountResponseSchema)
def create_account(account_data: AccountCreateSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create new account"""
    # Validate business rule: non-credit accounts cannot have negative balance
    if account_data.account_type != "Credit" and account_data.initial_balance < 0:
        raise HTTPException(status_code=400, detail="Non-credit accounts cannot have negative balance")
    
    # Generate masked account number
    masked_account_number = f"****{account_data.account_number[-4:]}"
    
    # Generate account name based on account type
    account_type_display = account_data.account_type
    if account_data.account_type == "Credit":
        account_type_display = "Credit Card"
    account_name = f"{account_type_display} Account"
    
    # Default currency to INR if empty
    currency = account_data.currency if account_data.currency else "INR"
    
    # Create new account
    new_account = Account(
        user_id=current_user.id,
        bank_name=account_data.bank_name,
        account_name=account_name,
        account_number=masked_account_number,
        account_type=account_data.account_type,
        currency=currency,
        balance=Decimal(str(account_data.initial_balance)),
        status="Active"
    )
    
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    
    return {
        "id": new_account.id,
        "bank_name": new_account.bank_name,
        "account_name": new_account.account_name,
        "account_number": new_account.account_number,
        "account_type": new_account.account_type,
        "currency": new_account.currency,
        "balance": float(new_account.balance) if new_account.balance else 0.0,
        "status": new_account.status
    }


@router.put("/{account_id}", response_model=AccountResponseSchema)
def update_account(account_id: int, account_data: AccountUpdateSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update account"""
    account = db.query(Account).filter_by(id=account_id, user_id=current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Update fields if provided
    if account_data.bank_name is not None:
        account.bank_name = account_data.bank_name
    
    if account_data.account_type is not None:
        # Validate business rule: non-credit accounts cannot have negative balance
        new_balance = account_data.balance if account_data.balance is not None else float(account.balance)
        if account_data.account_type != "Credit" and new_balance < 0:
            raise HTTPException(status_code=400, detail="Non-credit accounts cannot have negative balance")
        account.account_type = account_data.account_type
        # Update account_name based on new account type
        account_type_display = account_data.account_type
        if account_data.account_type == "Credit":
            account_type_display = "Credit Card"
        account.account_name = f"{account_type_display} Account"
    
    if account_data.currency is not None:
        account.currency = account_data.currency
    
    if account_data.balance is not None:
        # Validate business rule: non-credit accounts cannot have negative balance
        if account.account_type != "Credit" and account_data.balance < 0:
            raise HTTPException(status_code=400, detail="Non-credit accounts cannot have negative balance")
        account.balance = Decimal(str(account_data.balance))
    
    if account_data.status is not None:
        account.status = account_data.status
    
    db.commit()
    db.refresh(account)
    
    return {
        "id": account.id,
        "bank_name": account.bank_name,
        "account_name": account.account_name,
        "account_number": account.account_number,
        "account_type": account.account_type,
        "currency": account.currency,
        "balance": float(account.balance) if account.balance else 0.0,
        "status": account.status
    }


@router.delete("/{account_id}")
def delete_account(account_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Soft delete - set status to Inactive"""
    account = db.query(Account).filter_by(id=account_id, user_id=current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Soft delete - set status to Inactive
    account.status = "Inactive"
    db.commit()
    
    return {"message": "Account deleted successfully", "account_id": account_id}


# ============== NEW ENDPOINTS ==============

# Transfer money schema
class TransferRequestSchema(BaseModel):
    from_account_id: int
    to_bank_name: Optional[str] = None
    to_account_number: Optional[str] = None
    to_account_id: Optional[int] = None
    amount: float
    description: Optional[str] = None


class TransferResponseSchema(BaseModel):
    message: str
    transaction_id: int


# Request payment schema
class PaymentRequestSchema(BaseModel):
    from_account_id: int
    amount: float
    description: Optional[str] = None


class PaymentRequestResponseSchema(BaseModel):
    message: str
    request_id: int


from pydantic import BaseModel


@router.post("/transfer", response_model=TransferResponseSchema)
def transfer_money(
    transfer_data: TransferRequestSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Transfer money from one account to another"""
    # Get source account
    from_account = db.query(Account).filter_by(
        id=transfer_data.from_account_id,
        user_id=current_user.id
    ).first()
    
    if not from_account:
        raise HTTPException(status_code=404, detail="Source account not found")
    
    if from_account.status != "Active":
        raise HTTPException(status_code=400, detail="Source account is not active")
    
    # Get destination account
    to_account = db.query(Account).filter_by(id=transfer_data.to_account_id).first()
    
    if not to_account:
        raise HTTPException(status_code=404, detail="Destination account not found")
    
    # Validate amount
    if transfer_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Transfer amount must be positive")
    
    # Check sufficient balance (for non-credit accounts)
    if from_account.account_type != "Credit":
        if float(from_account.balance) < transfer_data.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        from_account.balance = Decimal(str(float(from_account.balance) - transfer_data.amount))
    else:
        # For credit accounts, check credit limit
        from_account.balance = Decimal(str(float(from_account.balance) + transfer_data.amount))
    
    # Add to destination account
    if to_account.account_type == "Credit":
        to_account.balance = Decimal(str(float(to_account.balance) - transfer_data.amount))
    else:
        to_account.balance = Decimal(str(float(to_account.balance) + transfer_data.amount))
    
    # Create transaction record for the transfer
    # Transaction for sender (debit)
    sender_transaction = Transaction(
        user_id=current_user.id,
        date=datetime.utcnow().date(),
        merchant=f"Transfer to {to_account.bank_name}",
        category="Transfer",
        type="debit",
        amount=transfer_data.amount,
        status="completed"
    )
    db.add(sender_transaction)
    
    # Commit changes
    db.commit()
    db.refresh(sender_transaction)
    
    return {
        "message": f"Successfully transferred {transfer_data.amount} {from_account.currency} to {to_account.bank_name}",
        "transaction_id": sender_transaction.id
    }


@router.post("/request-payment", response_model=PaymentRequestResponseSchema)
def request_payment(
    payment_data: PaymentRequestSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request payment from another user"""
    # Validate source account exists and belongs to current user
    from_account = db.query(Account).filter_by(
        id=payment_data.from_account_id,
        user_id=current_user.id
    ).first()
    
    if not from_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if from_account.status != "Active":
        raise HTTPException(status_code=400, detail="Account is not active")
    
    # Validate amount
    if payment_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be positive")
    
    # Create a pending transaction to represent the payment request
    # This acts as a "receivable" for the user
    request_transaction = Transaction(
        user_id=current_user.id,
        date=datetime.utcnow().date(),
        merchant=f"Payment Request: {payment_data.description or 'Payment'}",
        category="Payment Request",
        type="credit",
        amount=payment_data.amount,
        status="pending"
    )
    db.add(request_transaction)
    db.commit()
    db.refresh(request_transaction)
    
    return {
        "message": f"Payment request created for {payment_data.amount} {from_account.currency}",
        "request_id": request_transaction.id
    }


@router.get("/{account_id}/statement")
def download_statement(
    account_id: int,
    format: str = Query("csv", enum=["csv", "pdf"]),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download account statement in CSV or PDF format"""
    # Verify account belongs to user
    account = db.query(Account).filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Build query for transactions
    query = db.query(Transaction).filter_by(user_id=current_user.id)
    
    # Filter by date range if provided
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end)
        except ValueError:
            pass
    
    transactions = query.order_by(Transaction.date.desc()).all()
    
    if format == "csv":
        # Generate CSV
        buffer = io.StringIO()
        fieldnames = ['date', 'merchant', 'category', 'type', 'amount', 'status', 'balance']
        writer = csv.DictWriter(buffer, fieldnames=fieldnames)
        writer.writeheader()
        
        running_balance = float(account.balance)
        for t in transactions:
            # Calculate running balance based on transaction type
            if t.type == 'debit':
                running_balance += float(t.amount) if t.amount else 0
            else:
                running_balance -= float(t.amount) if t.amount else 0
            
            writer.writerow({
                'date': t.date.isoformat() if t.date else '',
                'merchant': t.merchant or '',
                'category': t.category or '',
                'type': t.type or '',
                'amount': str(float(t.amount)) if t.amount else '',
                'status': t.status or '',
                'balance': f"{running_balance:.2f}"
            })
        
        buffer.seek(0)
        
        headers = {
            'Content-Disposition': f'attachment; filename=account_statement_{account_id}.csv'
        }
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type='text/csv',
            headers=headers
        )
    
    elif format == "pdf":
        # Generate PDF
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
            from reportlab.lib import colors
        except Exception:
            raise HTTPException(status_code=500, detail='PDF generation library not installed')
        
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        # Header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(40, height - 50, f"Account Statement")
        
        c.setFont("Helvetica", 10)
        c.drawString(40, height - 75, f"Account: {account.account_name}")
        c.drawString(40, height - 90, f"Bank: {account.bank_name}")
        c.drawString(40, height - 105, f"Account Number: {account.account_number}")
        c.drawString(40, height - 120, f"Currency: {account.currency}")
        c.drawString(40, height - 135, f"Current Balance: {float(account.balance):.2f}")
        
        if start_date or end_date:
            date_range = f"Period: {start_date or 'Start'} to {end_date or 'End'}"
            c.drawString(40, height - 150, date_range)
        
        # Table headers
        y = height - 180
        c.setFont("Helvetica-Bold", 10)
        headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Status']
        xs = [40, 120, 240, 340, 420, 500]
        
        for i, h in enumerate(headers):
            c.drawString(xs[i], y, h)
        
        # Table rows
        y -= 18
        c.setFont("Helvetica", 9)
        
        running_balance = float(account.balance)
        for t in transactions:
            if y < 50:
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 9)
            
            # Calculate running balance
            if t.type == 'debit':
                running_balance += float(t.amount) if t.amount else 0
            else:
                running_balance -= float(t.amount) if t.amount else 0
            
            c.drawString(xs[0], y, t.date.isoformat() if t.date else '')
            c.drawString(xs[1], y, (t.merchant or '')[:25])
            c.drawString(xs[2], y, (t.category or '')[:15])
            c.drawString(xs[3], y, (t.type or '')[:10])
            c.drawRightString(xs[4] + 60, y, f"{float(t.amount):.2f}" if t.amount else '')
            c.drawString(xs[5], y, (t.status or ''))
            y -= 16
        
        c.save()
        buffer.seek(0)
        
        headers = {'Content-Disposition': f'attachment; filename=account_statement_{account_id}.pdf'}
        return StreamingResponse(buffer, media_type='application/pdf', headers=headers)
