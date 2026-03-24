import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

function RecentTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newTx, setNewTx] = useState({
        name: '',
        category: 'Shopping',
        amount: '',
        date: 'Today',
        income: false
    });

    const fetchTransactions = () => {
        fetch(`${API_BASE}/api/transactions`)
            .then(res => res.json())
            .then(data => setTransactions(data))
            .catch(err => console.error('Error fetching transactions:', err));
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAddTx = (e) => {
        e.preventDefault();
        const amt = parseFloat(newTx.amount);
        const txToPost = {
            ...newTx,
            amount: (newTx.income ? '₹' : '-₹') + amt.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            date: newTx.date || 'Today'
        };

        fetch(`${API_BASE}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(txToPost)
        })
            .then(() => {
                fetchTransactions();
                setShowModal(false);
                setNewTx({ name: '', category: 'Shopping', amount: '', date: 'Today', income: false });
            });
    };

    const handleDeleteTx = (name, date) => {
        if (!window.confirm(`Delete transaction: ${name}?`)) return;
        fetch(`${API_BASE}/api/transactions?name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}`, {
            method: 'DELETE'
        })
            .then(() => fetchTransactions());
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Recent Transactions</span>
                <span className="add-btn" onClick={() => setShowModal(true)}>+ Add Transaction</span>
            </div>
            <div className="transaction-list">
                {transactions.map((tx, i) => (
                    <div className="transaction-item" key={i}>
                        <div className={`tx-icon ${tx.income ? 'income-tx' : 'expense-tx'}`}>
                            {tx.income ? '↗' : '↙'}
                        </div>
                        <div className="tx-info-wrap">
                            <div className="tx-name">{tx.name}</div>
                            <div className="tx-category">{tx.category}</div>
                        </div>
                        <div className="tx-right">
                            <div className={`tx-amount ${tx.income ? 'income' : 'expense'}`}>
                                {tx.amount}
                            </div>
                            <div className="tx-date-wrap">
                                <span className="tx-date">{tx.date}</span>
                                <span className="delete-icon" onClick={() => handleDeleteTx(tx.name, tx.date)} title="Delete">🗑️</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add Transaction</h3>
                            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <form onSubmit={handleAddTx}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" value={newTx.name} onChange={e => setNewTx({...newTx, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={newTx.income} onChange={e => setNewTx({...newTx, income: e.target.value === 'true'})}>
                                    <option value="false">Expense</option>
                                    <option value="true">Income</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Transaction</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecentTransactions;
