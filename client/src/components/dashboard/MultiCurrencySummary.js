import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

function MultiCurrencySummary() {
    const [currencies, setCurrencies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCurr, setNewCurr] = useState({
        code: '',
        amount: '',
        rate: '',
        converted: '',
        change: '0.0%',
        changeClass: 'delta-up',
        arrow: 'up'
    });

    const fetchCurrencies = () => {
        fetch(`${API_BASE}/api/currencies`)
            .then(res => res.json())
            .then(data => setCurrencies(data))
            .catch(err => console.error('Error fetching currencies:', err));
    };

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const handleAddCurrency = (e) => {
        e.preventDefault();
        fetch(`${API_BASE}/api/currencies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCurr)
        })
            .then(() => {
                fetchCurrencies();
                setShowModal(false);
                setNewCurr({ code: '', amount: '', rate: '', converted: '', change: '0.0%', changeClass: 'delta-up', arrow: 'up' });
            });
    };

    const handleDeleteCurrency = (code) => {
        if (!window.confirm(`Delete ${code}?`)) return;
        fetch(`${API_BASE}/api/currencies/${encodeURIComponent(code)}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error('Delete failed');
                return res.json();
            })
            .then(() => fetchCurrencies())
            .catch(err => console.error('Delete error:', err));
    };

    // Calculate total balance across all currencies in INR
    const totalBalance = currencies.reduce((sum, curr) => {
        const value = parseFloat(curr.converted.replace(/[^\d.]/g, '')) || 0;
        return sum + value;
    }, 0);

    return (
        <div className="card">
            <div className="currency-header-row">
                <div>
                    <div className="card-title">Multi-Currency Summary</div>
                    <div className="currency-subtitle">View and convert your balances across currencies</div>
                </div>
                <div className="add-btn" onClick={() => setShowModal(true)}>+ Add Currency</div>
            </div>

            <div className="converted-total">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>

            <div className="currency-cards-grid">
                {currencies.map((c, idx) => (
                    <div className="currency-mini-card" key={`${c.code}-${idx}`}>
                        <div className="currency-mini-top">
                            <span className="currency-code">{c.code}</span>
                            <div className="mini-card-actions">
                                {c.change && (
                                    <span className={`currency-change ${c.changeClass}`}>
                                        {c.changeClass === 'delta-up' ? '↑' : '↓'} {c.change}
                                    </span>
                                )}
                                <span className="delete-icon" onClick={() => handleDeleteCurrency(c.code)} title="Delete">🗑️</span>
                            </div>
                        </div>
                        <div className="currency-amount">{c.amount}</div>
                        <div className="currency-row-label">Exchange Rate: {c.rate} ⟳</div>
                        <div className="currency-row-label">Converted Value: {c.converted}</div>
                    </div>
                ))}
            </div>

            <table className="currency-table">
                <thead>
                    <tr>
                        <th>Currency</th>
                        <th>Balance</th>
                        <th>Exchange Rate</th>
                        <th>Converted Value</th>
                    </tr>
                </thead>
                <tbody>
                    {currencies.map((r, idx) => (
                        <tr key={`${r.code}-row-${idx}`}>
                            <td>{r.code}</td>
                            <td>{r.amount}</td>
                            <td>
                                <span className="rate-cell">
                                    {r.rate}
                                    {r.arrow === 'up' && <span className="rate-arrow-up">↑</span>}
                                    {r.arrow === 'dn' && <span className="rate-arrow-dn">↓</span>}
                                </span>
                            </td>
                            <td>{r.converted}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="table-footer">
                <span>⟳ Rates updated just now</span>
                <span>Powered by ExchangeRates API</span>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Currency</h3>
                            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <form onSubmit={handleAddCurrency}>
                            <div className="form-group">
                                <label>Code (e.g. GBP)</label>
                                <input type="text" value={newCurr.code} onChange={e => setNewCurr({...newCurr, code: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Balance (e.g. £500.00)</label>
                                <input type="text" value={newCurr.amount} onChange={e => setNewCurr({...newCurr, amount: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Exchange Rate (to INR)</label>
                                <input type="text" value={newCurr.rate} onChange={e => setNewCurr({...newCurr, rate: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Converted Value (₹)</label>
                                <input type="text" value={newCurr.converted} onChange={e => setNewCurr({...newCurr, converted: e.target.value})} required />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Currency</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MultiCurrencySummary;
