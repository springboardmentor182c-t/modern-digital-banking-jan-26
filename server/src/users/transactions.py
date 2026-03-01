from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Header, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from datetime import datetime
from src.database.core import SessionLocal
from src.models.user import Transaction, User
from src.schemas import TransactionSchema
from typing import Optional
from src.auth.service import get_current_user_from_token as get_current_user

router = APIRouter()

# Simple dependency that retrieves DB session (mirrors existing pattern in auth.py)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", tags=["transactions"])
def list_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter_by(user_id=current_user.id).order_by(Transaction.date.desc()).all()
    data = []
    for t in txs:
        data.append({
            "id": t.id,
            "user_id": t.user_id,
            "date": t.date.isoformat() if t.date else None,
            "merchant": t.merchant,
            "category": t.category,
            "type": t.type,
            "amount": float(t.amount) if t.amount is not None else None,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None
        })
    return {"data": data}


@router.post('/import-csv', tags=["transactions"])
async def import_csv(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail='Only CSV files are accepted')

    content = await file.read()
    stream = io.StringIO(content.decode('utf-8'))
    reader = csv.DictReader(stream)

    created = 0
    for row in reader:
        # Expected columns: date, merchant, category, type, amount, status
        date_str = row.get('date') or row.get('Date')
        try:
            date_val = datetime.fromisoformat(date_str).date() if date_str else None
        except Exception:
            # Try common formats
            try:
                date_val = datetime.strptime(date_str, '%Y-%m-%d').date()
            except Exception:
                date_val = None

        merchant = row.get('merchant') or row.get('Merchant') or 'Unknown'
        category = row.get('category') or row.get('Category')
        type_raw = (row.get('type') or row.get('Type') or 'debit').lower()
        tx_type = 'credit' if type_raw == 'credit' else 'debit'
        try:
            amount = float(row.get('amount') or row.get('Amount') or 0)
        except Exception:
            amount = 0.0
        status_raw = (row.get('status') or row.get('Status') or 'completed').lower()
        status = 'pending' if status_raw == 'pending' else 'completed'

        tx = Transaction(
            user_id=current_user.id,
            date=date_val or datetime.utcnow().date(),
            merchant=merchant,
            category=category,
            type=tx_type,
            amount=amount,
            status=status
        )
        db.add(tx)
        created += 1

    db.commit()
    return {"message": f"Imported {created} transactions"}


@router.get('/export-csv', tags=["transactions"])
def export_csv(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter_by(user_id=current_user.id).order_by(Transaction.date.desc()).all()

    buffer = io.StringIO()
    fieldnames = ['date', 'merchant', 'category', 'type', 'amount', 'status']
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()

    for t in txs:
        writer.writerow({
            'date': t.date.isoformat() if t.date else '',
            'merchant': t.merchant or '',
            'category': t.category or '',
            'type': t.type or '',
            'amount': str(float(t.amount)) if t.amount is not None else '',
            'status': t.status or ''
        })

    buffer.seek(0)
    headers = {
        'Content-Disposition': 'attachment; filename=transactions.csv'
    }
    return Response(content=buffer.getvalue(), media_type='text/csv', headers=headers)


@router.get('/export-pdf', tags=["transactions"])
def export_pdf(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Generate a simple PDF in-memory using reportlab
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except Exception:
        raise HTTPException(status_code=500, detail='PDF generation library not installed')

    txs = db.query(Transaction).filter_by(user_id=current_user.id).order_by(Transaction.date.desc()).all()

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    x = 40
    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x, y, "Transactions")
    y -= 30

    c.setFont("Helvetica-Bold", 10)
    headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Status']
    xs = [x, x + 80, x + 240, x + 340, x + 420, x + 480]
    for i, h in enumerate(headers):
        c.drawString(xs[i], y, h)
    y -= 18

    c.setFont("Helvetica", 9)
    for t in txs:
        if y < 50:
            c.showPage()
            y = height - 50
        c.drawString(xs[0], y, t.date.isoformat() if t.date else '')
        c.drawString(xs[1], y, (t.merchant or '')[:30])
        c.drawString(xs[2], y, (t.category or '')[:20])
        c.drawString(xs[3], y, (t.type or ''))
        c.drawRightString(xs[4] + 60, y, f"{float(t.amount):.2f}" if t.amount is not None else '')
        c.drawString(xs[5], y, (t.status or ''))
        y -= 16

    c.save()
    buffer.seek(0)

    headers = {'Content-Disposition': 'attachment; filename=transactions.pdf'}
    return StreamingResponse(buffer, media_type='application/pdf', headers=headers)
