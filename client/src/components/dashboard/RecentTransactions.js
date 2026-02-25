import React from 'react';

const transactions = [
    { name: 'Starbucks Coffee', category: 'Food & Dining', amount: '-₹5.75', income: false, date: 'Jan 16' },
    { name: 'Salary Deposit', category: 'Income', amount: '+₹5200.00', income: true, date: 'Jan 15' },
    { name: 'Amazon Purchase', category: 'Shopping', amount: '-₹89.99', income: false, date: 'Jan 15' },
    { name: 'Netflix Subscription', category: 'Entertainment', amount: '-₹15.99', income: false, date: 'Jan 14' },
    { name: 'Shell Gas Station', category: 'Transportation', amount: '-₹45.20', income: false, date: 'Jan 14' },
];

function RecentTransactions() {
    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Recent Transactions</span>
                <span className="card-link">View All</span>
            </div>
            <div className="transaction-list">
                {transactions.map((tx, i) => (
                    <div className="transaction-item" key={i}>
                        <div className={`tx-icon ${tx.income ? 'income-tx' : 'expense-tx'}`}>
                            {tx.income ? '↗' : '↙'}
                        </div>
                        <div>
                            <div className="tx-name">{tx.name}</div>
                            <div className="tx-category">{tx.category}</div>
                        </div>
                        <div className="tx-right">
                            <div className={`tx-amount ${tx.income ? 'income' : 'expense'}`}>
                                {tx.amount}
                            </div>
                            <div className="tx-date">{tx.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecentTransactions;
