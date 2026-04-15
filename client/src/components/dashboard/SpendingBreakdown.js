import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { API_BASE } from '../../config';

function SpendingBreakdown() {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCat, setNewCat] = useState({ name: '', value: 0, color: '#818cf8' });

    const fetchSpending = () => {
        fetch(`${API_BASE}/api/spending`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Error fetching spending breakdown:', err));
    };

    useEffect(() => {
        fetchSpending();
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        fetch(`${API_BASE}/api/spending`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCat)
        })
            .then(() => {
                fetchSpending();
                setShowModal(false);
                setNewCat({ name: '', value: 0, color: '#818cf8' });
            });
    };

    const handleDelete = (name) => {
        if (!window.confirm(`Delete ${name}?`)) return;
        fetch(`${API_BASE}/api/spending/${name}`, { method: 'DELETE' })
            .then(() => fetchSpending());
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Spending Breakdown</span>
                <span className="add-btn" onClick={() => setShowModal(true)}>+ Add</span>
            </div>
            <div className="spending-chart-wrap">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={categories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            onClick={(entry) => entry && handleDelete(entry.name)}
                        >
                            {categories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                            formatter={(v) => [`₹${v}`, undefined]}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="spending-legend">
                    {categories.map((c) => (
                        <div className="spending-legend-item" key={c.name} style={{ cursor: 'pointer' }} onClick={() => handleDelete(c.name)}>
                            <div className="legend-left">
                                <div className="legend-dot" style={{ background: c.color }} />
                                <span>{c.name}</span>
                            </div>
                            <span className="legend-amount">₹{c.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add Spending Category</h3>
                            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input type="text" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} required placeholder="e.g. Travel" />
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input type="number" value={newCat.value} onChange={e => setNewCat({...newCat, value: parseFloat(e.target.value)})} required />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <input type="color" value={newCat.color} onChange={e => setNewCat({...newCat, color: e.target.value})} />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SpendingBreakdown;
