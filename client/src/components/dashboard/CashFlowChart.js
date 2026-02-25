import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const data = [
    { month: 'Jul', Income: 4200, Expenses: 3100 },
    { month: 'Aug', Income: 4500, Expenses: 3400 },
    { month: 'Sep', Income: 4100, Expenses: 3200 },
    { month: 'Oct', Income: 4600, Expenses: 4400 },
    { month: 'Nov', Income: 4800, Expenses: 3800 },
    { month: 'Dec', Income: 6000, Expenses: 4100 },
    { month: 'Jan', Income: 4500, Expenses: 1500 },
];

function CashFlowChart() {
    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">Cash Flow</span>
            </div>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data} barCategoryGap="30%" barGap={4}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v} />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                            formatter={(v) => [`₹${v.toLocaleString()}`, undefined]}
                        />
                        <Legend iconType="circle" iconSize={8}
                            wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                        <Bar dataKey="Income" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expenses" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default CashFlowChart;
