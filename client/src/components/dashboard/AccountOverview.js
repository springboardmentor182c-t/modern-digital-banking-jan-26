import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

function AccountOverview() {
    const [accounts, setAccounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newAccount, setNewAccount] = useState({
        label: '',
        number: '',
        balance: '',
        icon: '💰',
        iconClass: 'bg-blue',
        negative: false
    });

    const fetchAccounts = () => {
        fetch(`${API_BASE}/api/accounts`)
            .then(res => res.json())
            .then(data => setAccounts(data))
            .catch(err => console.error('Error fetching accounts:', err));
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleAddAccount = (e) => {
        e.preventDefault();
        fetch(`${API_BASE}/api/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAccount)
        })
            .then(() => {
                fetchAccounts();
                setShowModal(false);
                setNewAccount({ label: '', number: '', balance: '', icon: '💰', iconClass: 'bg-blue', negative: false });
            });
    };

    const handleDeleteAccount = (label) => {
        if (!window.confirm(`Delete ${label}?`)) return;
        fetch(`${API_BASE}/api/accounts/${encodeURIComponent(label)}`, { method: 'DELETE' })
            .then(() => fetchAccounts());
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Account Overview</span>
                <span className="add-btn" onClick={() => setShowModal(true)}>+ Add Account</span>
            </div>
            <div className="account-grid">
                {accounts.map((acc) => (
                    <div className="account-tile" key={acc.label}>
                        <div className="account-tile-top">
                            <div className={`account-tile-icon ${acc.iconClass}`}>{acc.icon}</div>
                            <span className="delete-icon" onClick={() => handleDeleteAccount(acc.label)} title="Delete">🗑️</span>
                        </div>
                        <div className="account-label">{acc.label}</div>
                        <div className="account-number">{acc.number}</div>
                        <div className={`account-balance${acc.negative ? ' negative' : ''}`}>
                            {acc.balance}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Account</h3>
                            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <form onSubmit={handleAddAccount}>
                            <div className="form-group">
                                <label>Label</label>
                                <input type="text" value={newAccount.label} onChange={e => setNewAccount({...newAccount, label: e.target.value})} required placeholder="e.g. My Savings" />
                            </div>
                            <div className="form-group">
                                <label>Number</label>
                                <input type="text" value={newAccount.number} onChange={e => setNewAccount({...newAccount, number: e.target.value})} required placeholder="**** 1234" />
                            </div>
                            <div className="form-group">
                                <label>Balance</label>
                                <input type="text" value={newAccount.balance} onChange={e => setNewAccount({...newAccount, balance: e.target.value})} required placeholder="₹10,000" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountOverview;
