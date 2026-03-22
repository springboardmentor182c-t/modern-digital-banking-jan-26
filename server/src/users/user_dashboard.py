"""
User Dashboard endpoint — provides aggregated data for the user-facing dashboard.
Derives cashflow, spending breakdown, rewards, notifications, alerts from
existing DB tables (transactions, budgets, accounts).
"""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from src.database.core import SessionLocal
from src.models.user import User, Account, Transaction, Budget
from src.auth.service import get_current_user_from_token as get_current_user

router = APIRouter()

CATEGORY_COLORS = {
    'Food & Dining': '#ff6384',
    'Shopping': '#36a2eb',
    'Transportation': '#ffce56',
    'Bills & Utilities': '#4bc0c0',
    'Entertainment': '#9966ff',
    'Healthcare': '#ff9f40',
    'Travel': '#c9cbcf',
    'Groceries': '#7bc043',
    'Education': '#f37735',
    'Personal Care': '#d11141',
    'Transfer': '#00b159',
    'Savings': '#00aedb',
    'Other': '#999999',
}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/summary")
def get_user_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aggregated dashboard summary for the logged-in user."""
    user_id = current_user.id

    # ── Accounts ──────────────────────────────────────────────────
    accounts_raw = db.query(Account).filter_by(user_id=user_id).all()
    accounts = []
    for acc in accounts_raw:
        icon = 'wallet'
        color = 'bg-primary'
        if acc.account_type == 'Savings':
            icon = 'piggy-bank'
            color = 'bg-success'
        elif acc.account_type == 'Credit':
            icon = 'credit-card'
            color = 'bg-destructive'
        elif acc.account_type == 'Investment':
            icon = 'trending-up'
            color = 'bg-secondary'

        accounts.append({
            "id": acc.id,
            "type": acc.account_type,
            "accountNumber": acc.account_number,
            "balance": float(acc.balance) if acc.balance else 0.0,
            "currency": acc.currency or "INR",
            "icon": icon,
            "color": color,
        })

    # ── Transactions (recent 5) ──────────────────────────────────
    recent_txs = (
        db.query(Transaction)
        .filter_by(user_id=user_id)
        .order_by(Transaction.date.desc())
        .limit(5)
        .all()
    )
    transactions = [
        {
            "id": t.id,
            "merchant": t.merchant or "Unknown",
            "category": t.category or "Other",
            "date": t.date.isoformat() if t.date else None,
            "amount": float(t.amount) if t.amount is not None else 0,
            "type": t.type or "debit",
            "status": t.status or "completed",
        }
        for t in recent_txs
    ]

    # ── Budgets ──────────────────────────────────────────────────
    budgets_raw = db.query(Budget).filter_by(user_id=user_id).all()
    budgets = [
        {
            "id": b.id,
            "category": b.category,
            "spent": float(b.spent) if b.spent else 0,
            "limit": float(b.limit) if b.limit else 0,
            "icon": b.icon or b.category.lower().replace(' ', '-'),
            "color": CATEGORY_COLORS.get(b.category, '#0066ff'),
        }
        for b in budgets_raw
    ]

    # ── Spending by category (debit transactions) ────────────────
    spending_rows = (
        db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total"),
        )
        .filter(Transaction.user_id == user_id, Transaction.type == "debit")
        .group_by(Transaction.category)
        .all()
    )
    spending_by_category = [
        {
            "name": row.category or "Other",
            "value": float(row.total),
            "fill": CATEGORY_COLORS.get(row.category or "Other", "#999999"),
        }
        for row in spending_rows
    ]

    # ── Cash flow data (monthly income vs expenses, last 7 months) ─
    today = datetime.utcnow().date()
    seven_months_ago = today.replace(day=1) - timedelta(days=180)

    monthly_rows = (
        db.query(
            extract("year", Transaction.date).label("yr"),
            extract("month", Transaction.date).label("mn"),
            Transaction.type,
            func.sum(Transaction.amount).label("total"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.date >= seven_months_ago,
        )
        .group_by("yr", "mn", Transaction.type)
        .all()
    )

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_map: dict = {}
    for row in monthly_rows:
        key = (int(row.yr), int(row.mn))
        if key not in monthly_map:
            monthly_map[key] = {"income": 0, "expenses": 0}
        if row.type == "credit":
            monthly_map[key]["income"] = float(row.total)
        else:
            monthly_map[key]["expenses"] = float(row.total)

    cash_flow_data = []
    for ym in sorted(monthly_map.keys()):
        cash_flow_data.append({
            "month": month_names[ym[1] - 1],
            "income": monthly_map[ym]["income"],
            "expenses": monthly_map[ym]["expenses"],
        })

    # If no data, provide at least one month so Dashboard doesn't crash
    if not cash_flow_data:
        cash_flow_data.append({
            "month": month_names[today.month - 1],
            "income": 0,
            "expenses": 0,
        })

    # ── Monthly spending trend (for Budgets page chart) ──────────
    monthly_spending_rows = (
        db.query(
            extract("year", Transaction.date).label("yr"),
            extract("month", Transaction.date).label("mn"),
            func.sum(Transaction.amount).label("total"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "debit",
            Transaction.date >= seven_months_ago,
        )
        .group_by("yr", "mn")
        .order_by("yr", "mn")
        .all()
    )
    monthly_spending = [
        {
            "month": month_names[int(row.mn) - 1],
            "spent": float(row.total),
        }
        for row in monthly_spending_rows
    ]

    # ── Rewards (derived from total debit transaction spend) ─────
    total_spend_row = (
        db.query(func.sum(Transaction.amount))
        .filter(Transaction.user_id == user_id, Transaction.type == "debit")
        .scalar()
    )
    total_spend = float(total_spend_row) if total_spend_row else 0
    total_points = int(total_spend)  # 1 point per ₹1

    # Tier calculation
    if total_points >= 50000:
        tier = "Platinum"
        points_to_next = 0
    elif total_points >= 25000:
        tier = "Gold"
        points_to_next = 50000 - total_points
    elif total_points >= 10000:
        tier = "Silver"
        points_to_next = 25000 - total_points
    else:
        tier = "Bronze"
        points_to_next = 10000 - total_points

    # Recent earnings from last 5 debit transactions
    recent_earnings = []
    for t in recent_txs:
        if t.type == "debit" and t.amount:
            recent_earnings.append({
                "date": t.date.isoformat() if t.date else None,
                "points": int(float(t.amount)),
                "description": f"{t.merchant or 'Transaction'} - {t.category or 'Other'}",
            })

    rewards = {
        "totalPoints": total_points,
        "programName": "SmartBank Rewards",
        "tier": tier,
        "pointsToNextTier": max(0, points_to_next),
        "recentEarnings": recent_earnings[:5],
    }

    # ── Alerts (derived from budgets + accounts) ─────────────────
    alerts = []
    alert_id = 1

    # Budget alerts
    for b in budgets_raw:
        spent = float(b.spent) if b.spent else 0
        limit_val = float(b.limit) if b.limit else 0
        if limit_val > 0 and spent >= limit_val:
            alerts.append({
                "id": alert_id,
                "type": "warning",
                "message": f"Budget for {b.category} exceeded by ₹{(spent - limit_val):.0f}",
                "date": datetime.utcnow().strftime("%b %d, %Y"),
                "icon": "alert-triangle",
            })
            alert_id += 1
        elif limit_val > 0 and spent >= limit_val * 0.85:
            alerts.append({
                "id": alert_id,
                "type": "info",
                "message": f"You've used {(spent / limit_val * 100):.0f}% of your {b.category} budget",
                "date": datetime.utcnow().strftime("%b %d, %Y"),
                "icon": "info",
            })
            alert_id += 1

    # Low balance alerts
    for acc in accounts_raw:
        bal = float(acc.balance) if acc.balance else 0
        if acc.status == "Active" and acc.account_type != "Credit" and bal < 5000:
            alerts.append({
                "id": alert_id,
                "type": "warning",
                "message": f"Low balance in {acc.account_type} account ({acc.account_number}): ₹{bal:,.0f}",
                "date": datetime.utcnow().strftime("%b %d, %Y"),
                "icon": "alert-triangle",
            })
            alert_id += 1

    # ── Notifications (derived from alerts + recent activity) ────
    notifications = []
    notif_id = 1

    # From budget alerts
    for b in budgets_raw:
        spent = float(b.spent) if b.spent else 0
        limit_val = float(b.limit) if b.limit else 0
        if limit_val > 0 and spent >= limit_val:
            notifications.append({
                "id": str(notif_id),
                "type": "budget",
                "title": "Budget Exceeded",
                "message": f"You have exceeded your {b.category} budget by ₹{(spent - limit_val):.0f}",
                "time": "Recently",
                "read": False,
            })
            notif_id += 1
        elif limit_val > 0 and spent >= limit_val * 0.85:
            notifications.append({
                "id": str(notif_id),
                "type": "budget",
                "title": "Budget Alert",
                "message": f"You have used {(spent / limit_val * 100):.0f}% of your {b.category} budget",
                "time": "Recently",
                "read": False,
            })
            notif_id += 1

    # From low balance
    for acc in accounts_raw:
        bal = float(acc.balance) if acc.balance else 0
        if acc.status == "Active" and acc.account_type != "Credit" and bal < 5000:
            notifications.append({
                "id": str(notif_id),
                "type": "balance",
                "title": "Low Balance Alert",
                "message": f"Your {acc.account_type} account balance has dropped below ₹5,000",
                "time": "Recently",
                "read": False,
            })
            notif_id += 1

    # Recent transactions as notifications
    for t in recent_txs[:3]:
        amt = float(t.amount) if t.amount else 0
        notifications.append({
            "id": str(notif_id),
            "type": "info",
            "title": f"{'Payment' if t.type == 'debit' else 'Credit'} - {t.merchant or 'Transaction'}",
            "message": f"₹{amt:,.0f} {t.type} transaction on {t.date.isoformat() if t.date else 'N/A'}",
            "time": "Recently",
            "read": True,
        })
        notif_id += 1

    # ── Bills (derived from upcoming 'pending' transactions) ─────
    pending_txs = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.status == "pending",
            Transaction.type == "debit",
        )
        .order_by(Transaction.date.asc())
        .limit(5)
        .all()
    )
    bills = [
        {
            "id": t.id,
            "name": t.merchant or "Unknown",
            "category": t.category or "Other",
            "dueDate": t.date.isoformat() if t.date else None,
            "amount": float(t.amount) if t.amount is not None else 0,
            "status": "upcoming",
            "autoPay": False,
            "icon": (t.category or "other").lower().replace(" ", "-").replace("&", ""),
        }
        for t in pending_txs
    ]

    return {
        "accounts": accounts,
        "transactions": transactions,
        "budgets": budgets,
        "bills": bills,
        "rewards": rewards,
        "alerts": alerts,
        "spendingByCategory": spending_by_category,
        "cashFlowData": cash_flow_data,
        "monthlySpending": monthly_spending,
        "notifications": notifications,
    }
