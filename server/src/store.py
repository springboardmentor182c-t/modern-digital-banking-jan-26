import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")

def load_data():
    if not os.path.exists(DATA_FILE):
        initial_data = {
            "budgets": [
                {"name": "Food & Dining", "total": 5000, "spent": 3200, "pct": 64, "icon": "🍔", "iconClass": "bg-blue", "color": "#3b82f6"},
                {"name": "Transport", "total": 3000, "spent": 1200, "pct": 40, "icon": "🚗", "iconClass": "bg-orange", "color": "#f59e0b"},
            ],
            "alerts": [
                {"type": "warning", "icon": "⚠️", "message": "Low balance in Savings", "date": "10 mins ago"},
                {"type": "info", "icon": "ℹ️", "message": "Salary credited", "date": "2 hours ago"},
            ],
            "transactions": [
                {"name": "Amazon", "category": "Shopping", "amount": "-₹1,240.00", "date": "Today", "income": False},
                {"name": "Freelance", "category": "Work", "amount": "+₹15,000.00", "date": "Yesterday", "income": True},
            ],
            "bills": [
                {"name": "Netflix", "due": "Due in 3 days", "amount": "₹499.00", "icon": "📋", "iconClass": "bg-blue", "autoPay": True},
                {"name": "Electricity", "due": "Due in 1 week", "amount": "₹1,200.00", "icon": "⚡", "iconClass": "bg-orange", "autoPay": False},
            ],
            "accounts": [
                {"label": "Savings Account", "number": "**** 4567", "balance": "₹1,24,500.00", "icon": "💰", "iconClass": "bg-blue", "negative": False},
                {"label": "Credit Card", "number": "**** 8901", "balance": "₹45,200.00", "icon": "💳", "iconClass": "bg-purple", "negative": True},
            ],
            "cashFlow": [
                {"month": "Jan", "Income": 45000, "Expenses": 32000},
                {"month": "Feb", "Income": 48000, "Expenses": 35000},
                {"month": "Mar", "Income": 52000, "Expenses": 38000},
            ],
            "spending": [
                {"name": "Shopping", "value": 4500, "color": "#818cf8"},
                {"name": "Food", "value": 3200, "color": "#f472b6"},
                {"name": "Bills", "value": 6500, "color": "#34d399"},
                {"name": "Others", "value": 2100, "color": "#fbbf24"},
            ],
            "summaryCards": [
                {"label": "Total Balance", "value": "₹1,24,500.00", "delta": "2.5% last month", "up": True, "icon": "💰", "iconClass": "bg-blue"},
                {"label": "Monthly Income", "value": "₹75,000.00", "delta": "5.2% last month", "up": True, "icon": "📈", "iconClass": "bg-green"},
                {"label": "Monthly Expenses", "value": "₹32,400.00", "delta": "1.8% last month", "up": False, "icon": "📉", "iconClass": "bg-red"},
                {"label": "Total Savings", "value": "₹45,200.00", "delta": "0.5% last month", "up": True, "icon": "🛡️", "iconClass": "bg-purple"},
            ],
            "currencies": [
                {"code": "USD", "amount": "$1,200.00", "rate": "83.20", "converted": "₹99,840.00", "change": "0.5%", "changeClass": "delta-up", "arrow": "up"},
                {"code": "EUR", "amount": "€850.00", "rate": "90.45", "converted": "₹76,882.50", "change": "0.2%", "changeClass": "delta-down", "arrow": "dn"},
            ]
        }
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_data, f, indent=4, ensure_ascii=False)
        return initial_data
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
