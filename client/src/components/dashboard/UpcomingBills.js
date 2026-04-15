import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

function Toggle({ checked, onChange }) {
    return (
        <label className="toggle">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="toggle-slider" />
        </label>
    );
}

function UpcomingBills() {
    const [bills, setBills] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newBill, setNewBill] = useState({
        name: '',
        amount: '',
        due: 'Due in 7 days',
        icon: '📋',
        iconClass: 'bg-blue',
        autoPay: false
    });

    const fetchBills = () => {
        fetch(`${API_BASE}/api/bills`)
            .then(res => res.json())
            .then(data => setBills(data))
            .catch(err => console.error('Error fetching bills:', err));
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleAddBill = (e) => {
        e.preventDefault();
        fetch(`${API_BASE}/api/bills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newBill,
                amount: '₹' + parseFloat(newBill.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })
            })
        })
            .then(() => {
                fetchBills();
                setShowModal(false);
                setNewBill({ name: '', amount: '', due: 'Due in 7 days', icon: '📋', iconClass: 'bg-blue', autoPay: false });
            });
    };

    const handleDeleteBill = (name) => {
        if (!window.confirm(`Delete bill: ${name}?`)) return;
        fetch(`${API_BASE}/api/bills/${encodeURIComponent(name)}`, { method: 'DELETE' })
            .then(() => fetchBills());
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Upcoming Bills</span>
                <span className="add-btn" onClick={() => setShowModal(true)}>+ Add Bill</span>
            </div>
            <div className="bills-list">
                {bills.map((b) => (
                    <div className="bill-item" key={b.name}>
                        <div className={`bill-icon ${b.iconClass}`}>{b.icon}</div>
                        <div className="bill-info">
                            <div className="bill-name">{b.name}</div>
                            <div className="bill-due">{b.due}</div>
                        </div>
                        <div className="bill-right">
                            <div className="bill-actions-top">
                                <div className="bill-amount">{b.amount}</div>
                                <span className="delete-icon" onClick={() => handleDeleteBill(b.name)} title="Delete">🗑️</span>
                            </div>
                            <div className="bill-badge-row">
                                <span className="bill-badge">Upcoming</span>
                                <div className="bill-autopay">
                                    Auto-pay <Toggle checked={b.autoPay} onChange={() => {}} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Bill</h3>
                            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <form onSubmit={handleAddBill}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" value={newBill.name} onChange={e => setNewBill({...newBill, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input type="number" value={newBill.amount} onChange={e => setNewBill({...newBill, amount: e.target.value})} required />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Bill</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UpcomingBills;
