import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

function BudgetSummary() {
    const [budgets, setBudgets] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newBudget, setNewBudget] = useState({
        name: '',
        total: '',
        icon: '💰',
        color: '#3b82f6',
        iconClass: 'bg-blue'
    });

    const fetchBudgets = () => {
        fetch(`${API_BASE}/api/budgets`)
            .then(res => res.json())
            .then(data => setBudgets(data))
            .catch(err => console.error('Error fetching budgets:', err));
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleAddBudget = (e) => {
        e.preventDefault();
        const budgetToPost = {
            ...newBudget,
            total: parseFloat(newBudget.total),
            spent: 0,
            pct: 0
        };

        fetch(`${API_BASE}/api/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(budgetToPost)
        })
            .then(() => {
                fetchBudgets();
                setShowModal(false);
                setNewBudget({ name: '', total: '', icon: '💰', color: '#3b82f6', iconClass: 'bg-blue' });
            })
            .catch(err => console.error('Error adding budget:', err));
    };

    const handleDeleteBudget = (name) => {
        if (!window.confirm(`Delete budget: ${name}?`)) return;
        fetch(`${API_BASE}/api/budgets/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        })
            .then(() => fetchBudgets())
            .catch(err => console.error('Error deleting budget:', err));
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Budget Summary</span>
                <span className="add-btn" onClick={() => setShowModal(true)}>+ Add Budget</span>
            </div>
            <div className="budget-list">
                {budgets.map((b, i) => (
                    <div className="budget-item" key={i}>
                        <div className="budget-item-top">
                            <div className="budget-item-left">
                                <div className={`budget-item-icon ${b.iconClass}`} style={{ backgroundColor: b.color + '22', color: b.color }}>{b.icon}</div>
                                <div className="budget-item-name">{b.name}</div>
                            </div>
                            <div className="budget-item-right-actions">
                                <div className="budget-item-amounts">
                                    ₹{b.spent.toLocaleString()} / ₹{b.total.toLocaleString()}
                                </div>
                                <span className="delete-icon" onClick={() => handleDeleteBudget(b.name)} title="Delete">🗑️</span>
                            </div>
                        </div>
                        <div className="budget-progress-wrap">
                            <div className="budget-progress-bg">
                                <div
                                    className="budget-progress-fill"
                                    style={{ width: `${b.pct}%`, background: b.color }}
                                />
                            </div>
                            <div className="budget-pct">{b.pct}% used</div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Budget</h3>
                            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <form onSubmit={handleAddBudget}>
                            <div className="form-group">
                                <label>Budget Name</label>
                                <input type="text" value={newBudget.name} onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Total Amount (₹)</label>
                                <input type="number" value={newBudget.total} onChange={(e) => setNewBudget({ ...newBudget, total: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Icon</label>
                                <select value={newBudget.icon} onChange={(e) => setNewBudget({ ...newBudget, icon: e.target.value })}>
                                    <option value="💰">💰 Money</option>
                                    <option value="🚗">🚗 Transport</option>
                                    <option value="🏠">🏠 Housing</option>
                                    <option value="🍔">🍔 Food</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <input type="color" value={newBudget.color} onChange={(e) => setNewBudget({ ...newBudget, color: e.target.value })} />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Budget</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BudgetSummary;
