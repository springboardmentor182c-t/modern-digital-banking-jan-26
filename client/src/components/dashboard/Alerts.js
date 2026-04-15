import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newAlert, setNewAlert] = useState({
        type: 'info',
        icon: 'ℹ️',
        message: ''
    });

    const fetchAlerts = () => {
        fetch(`${API_BASE}/api/alerts`)
            .then(res => res.json())
            .then(data => setAlerts(data))
            .catch(err => console.error('Error fetching alerts:', err));
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleAddAlert = (e) => {
        e.preventDefault();
        fetch(`${API_BASE}/api/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newAlert, date: 'Just now' })
        })
            .then(() => {
                fetchAlerts();
                setShowModal(false);
                setNewAlert({ type: 'info', icon: 'ℹ️', message: '' });
            });
    };

    const handleDeleteAlert = (message) => {
        if (!window.confirm(`Delete alert: ${message}?`)) return;
        fetch(`${API_BASE}/api/alerts?message=${encodeURIComponent(message)}`, { method: 'DELETE' })
            .then(() => fetchAlerts());
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Alerts</span>
                <span className="add-btn" onClick={() => setShowModal(true)}>+ Add Alert</span>
            </div>
            <div className="alert-list">
                {alerts.map((a, i) => (
                    <div className={`alert-item ${a.type}`} key={i}>
                        <div className="alert-content-left">
                            <span className="alert-icon">{a.icon}</span>
                            <div>
                                <div className="alert-msg">{a.message}</div>
                                <div className="alert-date">{a.date}</div>
                            </div>
                        </div>
                        <span className="delete-icon" onClick={() => handleDeleteAlert(a.message)} title="Delete">🗑️</span>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Create New Alert</h3>
                            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <form onSubmit={handleAddAlert}>
                            <div className="form-group">
                                <label>Message</label>
                                <input type="text" value={newAlert.message} onChange={e => setNewAlert({...newAlert, message: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={newAlert.type} onChange={e => {
                                    let icon = 'ℹ️';
                                    if (e.target.value === 'warning') icon = '⚠️';
                                    if (e.target.value === 'success') icon = '✅';
                                    setNewAlert({...newAlert, type: e.target.value, icon});
                                }}>
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="success">Success</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Alert</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Alerts;
