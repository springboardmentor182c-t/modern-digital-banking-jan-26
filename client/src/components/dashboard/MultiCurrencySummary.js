import React from 'react';

const currencies = [
    {
        code: 'INR', symbol: '₹', amount: '₹1,25,000.00',
        change: null, rate: '1.00', converted: '₹1,25,000.00',
        changeClass: '',
    },
    {
        code: 'USD', symbol: '$', amount: '$850.00',
        change: '-0.5%', rate: '83.25', converted: '₹70,762.50',
        changeClass: 'delta-down',
    },
    {
        code: 'EUR', symbol: '€', amount: '€420.00',
        change: '+0.3%', rate: '90.15', converted: '₹37,863.00',
        changeClass: 'delta-up',
    },
    {
        code: 'GBP', symbol: '£', amount: '£250.00',
        change: '+0.2%', rate: '105.80', converted: '₹26,450.00',
        changeClass: 'delta-up',
    },
];

const tableRows = [
    { currency: 'INR ₹', balance: '₹1,25,000.00', rate: '1.00', converted: '₹1,25,000.00', arrow: null },
    { currency: 'USD $', balance: '$850.00', rate: '83.25', converted: '₹70,762.50', arrow: 'dn' },
    { currency: 'EUR €', balance: '€420.00', rate: '90.15', converted: '₹37,863.00', arrow: 'up' },
    { currency: 'GBP £', balance: '£250.00', rate: '105.80', converted: '₹26,450.00', arrow: 'up' },
];

function MultiCurrencySummary() {
    return (
        <div className="card">
            <div className="currency-header-row">
                <div>
                    <div className="card-title">Multi-Currency Summary</div>
                    <div className="currency-subtitle">View and convert your balances across currencies</div>
                </div>
                <div className="base-currency-select">Base Currency: INR ₹ ▾</div>
            </div>

            <div className="converted-total">₹2,60,075.50</div>

            <div className="currency-cards-grid">
                {currencies.map((c) => (
                    <div className="currency-mini-card" key={c.code}>
                        <div className="currency-mini-top">
                            <span className="currency-code">{c.code}</span>
                            {c.change && (
                                <span className={`currency-change ${c.changeClass}`}>
                                    {c.changeClass === 'delta-up' ? '↑' : '↓'} {c.change}
                                </span>
                            )}
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
                    {tableRows.map((r) => (
                        <tr key={r.currency}>
                            <td>{r.currency}</td>
                            <td>{r.balance}</td>
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
        </div>
    );
}

export default MultiCurrencySummary;
