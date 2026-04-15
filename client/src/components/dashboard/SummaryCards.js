import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

function SummaryCards() {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/api/summary-cards`)
            .then(res => res.json())
            .then(data => setCards(data))
            .catch(err => console.error('Error fetching summary cards:', err));
    }, []);

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
