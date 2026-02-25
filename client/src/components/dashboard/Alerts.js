import React from 'react';

const alerts = [
    {
        type: 'warning',
        icon: '⚠',
        message: 'Dining Out budget almost reached (95%)',
        date: '2026-01-16',
    },
    {
        type: 'info',
        icon: '🔔',
        message: 'Your electric bill is due in 4 days',
        date: '2026-01-16',
    },
    {
        type: 'success',
        icon: '✔',
        message: 'Salary deposit received',
        date: '2026-01-15',
    },
];

function Alerts() {
    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Alerts</span>
            </div>
            <div className="alert-list">
                {alerts.map((a, i) => (
                    <div className={`alert-item ${a.type}`} key={i}>
                        <span className="alert-icon">{a.icon}</span>
                        <div>
                            <div className="alert-msg">{a.message}</div>
                            <div className="alert-date">{a.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Alerts;
