import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const categories = [
    { name: 'Groceries', value: 456, color: '#6ee7b7' },
    { name: 'Dining', value: 285, color: '#fde68a' },
    { name: 'Shopping', value: 320, color: '#fca5a5' },
    { name: 'Transport', value: 145, color: '#93c5fd' },
    { name: 'Entertainment', value: 80, color: '#c4b5fd' },
    { name: 'Bills', value: 680, color: '#d1d5db' },
];

function SpendingBreakdown() {
    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Spending Breakdown</span>
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
                        <div className="spending-legend-item" key={c.name}>
                            <div className="legend-left">
                                <div className="legend-dot" style={{ background: c.color }} />
                                <span>{c.name}</span>
                            </div>
                            <span className="legend-amount">₹{c.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SpendingBreakdown;
