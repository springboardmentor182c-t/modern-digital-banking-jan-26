import React from 'react';

const budgets = [
    {
        name: 'Groceries', icon: '🛒', iconClass: 'icon-green',
        spent: 450.32, total: 600.00, pct: 76, color: '#10b981',
    },
    {
        name: 'Dining Out', icon: '🍽', iconClass: 'icon-orange',
        spent: 285.50, total: 300.00, pct: 95, color: '#f59e0b',
    },
    {
        name: 'Transportation', icon: '🚗', iconClass: 'icon-blue',
        spent: 145.20, total: 200.00, pct: 73, color: '#3b82f6',
    },
];

function BudgetSummary() {
    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Budget Summary</span>
                <span className="card-link">Manage Budgets</span>
            </div>
            <div className="budget-list">
                {budgets.map((b) => (
                    <div className="budget-item" key={b.name}>
                        <div className="budget-item-top">
                            <div className="budget-item-left">
                                <div className={`budget-item-icon ${b.iconClass}`}>{b.icon}</div>
                                <div className="budget-item-name">{b.name}</div>
                            </div>
                            <div className="budget-item-amounts">
                                ₹{b.spent.toFixed(2)} / ₹{b.total.toFixed(2)}
                            </div>
                        </div>
                        <div className="budget-progress-wrap">
                            <div className="budget-progress-bg">
                                <div
                                    className="budget-progress-fill"
                                    style={{ width: `${b.pct}%`, background: b.color }}
                                />
                            </div>
                            <div className="budget-pct">{b.pct}% of budget used</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BudgetSummary;
