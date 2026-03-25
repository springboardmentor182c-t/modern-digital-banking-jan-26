from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from datetime import datetime
import jwt

from src.database.core import SessionLocal, DB_AVAILABLE
from src.models.user import Budget, User
from src.schemas import BudgetSchema, BudgetCreateSchema, BudgetUpdateSchema
from src.auth.service import SECRET_KEY, ALGORITHM

router = APIRouter()

MOCK_BUDGETS = [
    {"id": 'mock-1', "user_id": 1, "category": "Food & Dining", "limit": 5000, "spent": 1200, "icon": "food-&-dining", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-2', "user_id": 1, "category": "Shopping", "limit": 4000, "spent": 3800, "icon": "shopping", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-3', "user_id": 1, "category": "Transportation", "limit": 2500, "spent": 800, "icon": "transportation", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-4', "user_id": 1, "category": "Bills & Utilities", "limit": 8000, "spent": 8500, "icon": "bills-&-utilities", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-5', "user_id": 1, "category": "Entertainment", "limit": 3000, "spent": 2900, "icon": "entertainment", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-6', "user_id": 1, "category": "Healthcare", "limit": 10000, "spent": 1000, "icon": "healthcare", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-7', "user_id": 1, "category": "Travel", "limit": 15000, "spent": 0, "icon": "travel", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-8', "user_id": 1, "category": "Groceries", "limit": 6000, "spent": 4500, "icon": "groceries", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-9', "user_id": 1, "category": "Education", "limit": 5000, "spent": 1500, "icon": "education", "created_at": "2026-03-01T10:00:00"},
    {"id": 'mock-10', "user_id": 1, "category": "Personal Care", "limit": 2000, "spent": 1900, "icon": "personal-care", "created_at": "2026-03-01T10:00:00"},
]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", tags=["budgets"])
def list_budgets(request: Request, db: Session = Depends(get_db)):
    print("DEBUG: Entered list_budgets endpoint")
    if not DB_AVAILABLE:
        return {"data": MOCK_BUDGETS}
        
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            user_id = 1
        else:
            token_str = auth_header.replace("Bearer ", "") if "Bearer" in auth_header else auth_header
            payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 1))
    except Exception:
        user_id = 1

    budgets = db.query(Budget).filter_by(user_id=user_id).order_by(Budget.created_at.desc()).all()
    data = []
    for b in budgets:
        data.append({
            "id": str(b.id),
            "user_id": b.user_id,
            "category": b.category,
            "spent": float(b.spent) if b.spent is not None else 0.0,
            "limit": float(b.limit) if b.limit is not None else 0.0,
            "icon": b.icon or b.category.lower().replace(" ", "-"),
            "created_at": b.created_at.isoformat() if b.created_at else None
        })
    return {"data": data}


@router.post("/", tags=["budgets"])
def create_budget(budget_in: BudgetCreateSchema, request: Request, db: Session = Depends(get_db)):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header: user_id = 1
        else:
            token_str = auth_header.replace("Bearer ", "") if "Bearer" in auth_header else auth_header
            payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 1))
    except Exception:
        user_id = 1

    if not DB_AVAILABLE:
        if any(b['category'].lower() == budget_in.category.lower() for b in MOCK_BUDGETS):
            raise HTTPException(status_code=400, detail="A budget for this category already exists")
        new_b = {
            "id": f"mock-{len(MOCK_BUDGETS)+1}", "user_id": user_id,
            "category": budget_in.category, "limit": budget_in.limit,
            "spent": budget_in.spent or 0.0,
            "icon": budget_in.icon or budget_in.category.lower().replace(" ", "-"),
            "created_at": datetime.utcnow().isoformat()
        }
        MOCK_BUDGETS.append(new_b)
        return {"message": "Budget created successfully", "id": new_b["id"]}

    # Check if a budget for this category already exists for the user
    existing = db.query(Budget).filter_by(user_id=user_id, category=budget_in.category).first()
    if existing:
        raise HTTPException(status_code=400, detail="A budget for this category already exists")
    
    new_budget = Budget(
        user_id=user_id,
        category=budget_in.category,
        spent=budget_in.spent or 0.0,
        limit=budget_in.limit,
        icon=budget_in.icon or budget_in.category.lower().replace(" ", "-")
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    
    return {"message": "Budget created successfully", "id": new_budget.id}


@router.put("/{budget_id}", tags=["budgets"])
def update_budget(budget_id: str, budget_in: BudgetUpdateSchema, request: Request, db: Session = Depends(get_db)):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header: user_id = 1
        else:
            token_str = auth_header.replace("Bearer ", "") if "Bearer" in auth_header else auth_header
            payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 1))
    except Exception:
        user_id = 1

    if not DB_AVAILABLE:
        for b in MOCK_BUDGETS:
            if str(b["id"]) == budget_id:
                if budget_in.limit is not None: b["limit"] = budget_in.limit
                if budget_in.spent is not None: b["spent"] = budget_in.spent
                if budget_in.category is not None: b["category"] = budget_in.category
                if budget_in.icon is not None: b["icon"] = budget_in.icon
                return {"message": "Budget updated successfully"}
        raise HTTPException(status_code=404, detail="Budget not found")

    budget = db.query(Budget).filter_by(id=int(budget_id), user_id=user_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    if budget_in.limit is not None:
        budget.limit = budget_in.limit
    if budget_in.spent is not None:
        budget.spent = budget_in.spent
    if budget_in.category is not None:
        budget.category = budget_in.category
    if budget_in.icon is not None:
        budget.icon = budget_in.icon
        
    db.commit()
    return {"message": "Budget updated successfully"}


@router.delete("/{budget_id}", tags=["budgets"])
def delete_budget(budget_id: str, request: Request, db: Session = Depends(get_db)):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header: user_id = 1
        else:
            token_str = auth_header.replace("Bearer ", "") if "Bearer" in auth_header else auth_header
            payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 1))
    except Exception:
        user_id = 1

    if not DB_AVAILABLE:
        for i, b in enumerate(MOCK_BUDGETS):
            if str(b["id"]) == budget_id:
                MOCK_BUDGETS.pop(i)
                return {"message": "Budget deleted successfully"}
        raise HTTPException(status_code=404, detail="Budget not found")

    budget = db.query(Budget).filter_by(id=int(budget_id), user_id=user_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}


@router.get('/export-csv', tags=["budgets"])
def export_csv(request: Request, db: Session = Depends(get_db)):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header: user_id = 1
        else:
            token_str = auth_header.replace("Bearer ", "") if "Bearer" in auth_header else auth_header
            payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 1))
    except Exception:
        user_id = 1

    if not DB_AVAILABLE:
        budgets_data = MOCK_BUDGETS
    else:
        db_budgets = db.query(Budget).filter_by(user_id=user_id).order_by(Budget.created_at.desc()).all()
        budgets_data = []
        for b in db_budgets:
            budgets_data.append({
                "category": b.category,
                "limit": float(b.limit) if b.limit is not None else 0.0,
                "spent": float(b.spent) if b.spent is not None else 0.0,
                "created_at": b.created_at.strftime("%Y-%m-%d") if b.created_at else ''
            })

    buffer = io.StringIO()
    fieldnames = ['category', 'limit', 'spent', 'remaining', 'status', 'created_at']
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()

    for b in budgets_data:
        limit = b.get('limit', 0.0)
        spent = b.get('spent', 0.0)
        remaining = limit - spent
        status = "Exceeded" if spent > limit else ("At Risk" if spent > limit * 0.75 else "On Track")
        created_at_val = b.get('created_at', '')
        if isinstance(created_at_val, datetime):
            created_at_val = created_at_val.strftime("%Y-%m-%d")
        elif "T" in created_at_val:
            created_at_val = created_at_val.split("T")[0]
            
        
        writer.writerow({
            'category': b['category'],
            'limit': str(limit),
            'spent': str(spent),
            'remaining': str(remaining),
            'status': status,
            'created_at': created_at_val
        })

    buffer.seek(0)
    headers = {
        'Content-Disposition': 'attachment; filename=budgets.csv'
    }
    return Response(content=buffer.getvalue(), media_type='text/csv', headers=headers)


@router.get('/export-pdf', tags=["budgets"])
def export_pdf(request: Request, db: Session = Depends(get_db)):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header: user_id = 1
        else:
            token_str = auth_header.replace("Bearer ", "") if "Bearer" in auth_header else auth_header
            payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 1))
    except Exception:
        user_id = 1

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except Exception:
        raise HTTPException(status_code=500, detail='PDF generation library not installed')

    if not DB_AVAILABLE:
        budgets_data = MOCK_BUDGETS
    else:
        db_budgets = db.query(Budget).filter_by(user_id=user_id).order_by(Budget.created_at.desc()).all()
        budgets_data = []
        for b in db_budgets:
            budgets_data.append({
                "category": b.category,
                "limit": float(b.limit) if b.limit is not None else 0.0,
                "spent": float(b.spent) if b.spent is not None else 0.0,
            })

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    x = 40
    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x, y, "Budgets Summary")
    y -= 30

    c.setFont("Helvetica-Bold", 10)
    headers = ['Category', 'Limit', 'Spent', 'Remaining', 'Status']
    xs = [x, x + 120, x + 220, x + 320, x + 420]
    for i, h in enumerate(headers):
        c.drawString(xs[i], y, h)
    y -= 18

    c.setFont("Helvetica", 9)
    for b in budgets_data:
        if y < 50:
            c.showPage()
            y = height - 50
            
        limit = b.get('limit', 0.0)
        spent = b.get('spent', 0.0)
        remaining = limit - spent
        status = "Exceeded" if spent > limit else ("At Risk" if spent > limit * 0.75 else "On Track")
            
        c.drawString(xs[0], y, str(b['category'])[:25])
        c.drawRightString(xs[1] + 30, y, f"{limit:.2f}")
        c.drawRightString(xs[2] + 30, y, f"{spent:.2f}")
        c.drawRightString(xs[3] + 50, y, f"{remaining:.2f}")
        c.drawString(xs[4], y, status)
        y -= 16

    c.save()
    buffer.seek(0)

    headers = {'Content-Disposition': 'attachment; filename=budgets.pdf'}
    return StreamingResponse(buffer, media_type='application/pdf', headers=headers)
