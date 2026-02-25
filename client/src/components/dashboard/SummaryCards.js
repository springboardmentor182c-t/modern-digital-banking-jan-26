import React from 'react';

const cards = [
    {
        label: 'Total Balance',
        value: '₹76,641.50',
        delta: '+12.5% from last month',
        up: true,
        icon: '$',
        iconClass: 'icon-blue',
    },
    {
        label: 'Monthly Income',
        value: '₹5,200',
        delta: '+5.2% from last month',
        up: true,
        icon: '↗',
        iconClass: 'icon-green',
    },
    {
        label: 'Monthly Expenses',
        value: '₹1,976',
        delta: '-8.4% from last month',
        up: false,
        icon: '↙',
        iconClass: 'icon-orange',
    },
    {
        label: 'Rewards Points',
        value: '12,450',
        delta: 'Gold Member',
        up: null,
        icon: '✦',
        iconClass: 'icon-purple',
    },
];

function SummaryCards() {
    return (
        <div className="summary-grid">
            {cards.map((c) => (
                <div className="summary-card" key={c.label}>
                    <div className="summary-card-left">
                        <div className="summary-card-label">{c.label}</div>
                        <div className="summary-card-value">{c.value}</div>
                        <div
                            className={`summary-card-delta ${c.up === true ? 'delta-up' : c.up === false ? 'delta-down' : ''
                                }`}
                        >
                            {c.up === true && '↑ '}
                            {c.up === false && '↓ '}
                            {c.delta}
                        </div>
                    </div>
                    <div className={`summary-card-icon ${c.iconClass}`}>{c.icon}</div>
                </div>
            ))}
        </div>
    );
}

export default SummaryCards;
