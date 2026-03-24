import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE } from '../../config';

function CashFlowChart() {
    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newEntry, setNewEntry] = useState({ month: '', Income: 0, Expenses: 0 });

    const fetchCashFlow = () => {
        fetch(`${API_BASE}/api/cash-flow`)
            .then(res => res.json())
            .then(fetchedData => setData(fetchedData))
            .catch(err => console.error('Error fetching cash flow data:', err));
    };

    useEffect(() => {
        fetchCashFlow();
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        fetch(`${API_BASE}/api/cash-flow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEntry)
        })
            .then(() => {
                fetchCashFlow();
                setShowModal(false);
                setNewEntry({ month: '', Income: 0, Expenses: 0 });
            });
    };

    const handleDelete = (month) => {
        if (!window.confirm(`Delete ${month}?`)) return;
        fetch(`${API_BASE}/api/cash-flow/${month}`, { method: 'DELETE' })
            .then(() => fetchCashFlow());
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Cash Flow</span>
                <span className="add-btn" onClick={() => setShowModal(true)}>+ Add</span>
            </div>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data} barCategoryGap="30%" barGap={4}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        onClick={(entry) => entry && entry.activePayload && handleDelete(entry.activePayload[0].payload.month)}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v} />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                            formatter={(v) => [`₹${v.toLocaleString()}`, undefined]}
                        />
                        <Legend iconType="circle" iconSize={8}
                            wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                        <Bar dataKey="Income" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expenses" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add Cash Flow Data</h3>
                            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Month</label>
                                <input type="text" value={newEntry.month} onChange={e => setNewEntry({...newEntry, month: e.target.value})} required placeholder="e.g. Apr" />
                            </div>
                            <div className="form-group">
                                <label>Income</label>
                                <input type="number" value={newEntry.Income} onChange={e => setNewEntry({...newEntry, Income: parseFloat(e.target.value)})} required />
                            </div>
                            <div className="form-group">
                                <label>Expenses</label>
                                <input type="number" value={newEntry.Expenses} onChange={e => setNewEntry({...newEntry, Expenses: parseFloat(e.target.value)})} required />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CashFlowChart;
