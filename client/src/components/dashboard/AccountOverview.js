import React from 'react';

const accounts = [
    { label: 'Savings', number: '****4892', balance: 'INR 24,750.50', iconClass: 'icon-teal', icon: '💰', negative: false },
    { label: 'Checking', number: '****7123', balance: 'INR 8,420.25', iconClass: 'icon-blue', icon: '🏦', negative: false },
    { label: 'Credit Card', number: '****9845', balance: '-INR 2,150.00', iconClass: 'icon-purple', icon: '💳', negative: true },
    { label: 'Investment', number: '****2401', balance: 'INR 45,620.75', iconClass: 'icon-orange', icon: '📈', negative: false },
];

function AccountOverview() {
    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Account Overview</span>
                <span className="card-link">View All</span>
            </div>
            <div className="account-grid">
                {accounts.map((acc) => (
                    <div className="account-tile" key={acc.label}>
                        <div className="account-tile-top">
                            <div className={`account-tile-icon ${acc.iconClass}`}>{acc.icon}</div>
                            <span className="account-tile-eye">👁</span>
                        </div>
                        <div className="account-label">{acc.label}</div>
                        <div className="account-number">{acc.number}</div>
                        <div className={`account-balance${acc.negative ? ' negative' : ''}`}>
                            {acc.balance}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AccountOverview;
