import React, { useState } from 'react';

const bills = [
    {
        name: 'Electric Bill', due: 'Due Jan 20, 2026',
        amount: '₹85.00', icon: '⚡', iconClass: 'icon-orange', autoPay: true,
    },
    {
        name: 'Internet Service', due: 'Due Jan 16, 2026',
        amount: '₹79.99', icon: '🌐', iconClass: 'icon-blue', autoPay: true,
    },
    {
        name: 'Phone Bill', due: 'Due Jan 25, 2026',
        amount: '₹65.00', icon: '📱', iconClass: 'icon-purple', autoPay: false,
    },
];

function Toggle({ checked, onChange }) {
    return (
        <label className="toggle">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="toggle-slider" />
        </label>
    );
}

function UpcomingBills() {
    const [autoPay, setAutoPay] = useState(bills.map(b => b.autoPay));

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Upcoming Bills</span>
                <span className="card-link">View All</span>
            </div>
            <div className="bills-list">
                {bills.map((b, i) => (
                    <div className="bill-item" key={b.name}>
                        <div className={`bill-icon ${b.iconClass}`}>{b.icon}</div>
                        <div className="bill-info">
                            <div className="bill-name">{b.name}</div>
                            <div className="bill-due">{b.due}</div>
                        </div>
                        <div className="bill-right">
                            <div className="bill-amount">{b.amount}</div>
                            <div className="bill-badge-row">
                                <span className="bill-badge">Upcoming</span>
                                <div className="bill-autopay">
                                    Auto-pay
                                    <Toggle
                                        checked={autoPay[i]}
                                        onChange={() => setAutoPay(prev => prev.map((v, idx) => idx === i ? !v : v))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UpcomingBills;
