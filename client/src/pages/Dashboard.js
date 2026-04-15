import React from 'react';
import SummaryCards from '../components/dashboard/SummaryCards';
import AccountOverview from '../components/dashboard/AccountOverview';
import MultiCurrencySummary from '../components/dashboard/MultiCurrencySummary';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import SpendingBreakdown from '../components/dashboard/SpendingBreakdown';
import Alerts from '../components/dashboard/Alerts';
import BudgetSummary from '../components/dashboard/BudgetSummary';
import UpcomingBills from '../components/dashboard/UpcomingBills';

function Dashboard() {
    return (
        <>
            {/* 1. Top summary metrics (4 cards) */}
            <SummaryCards />

            {/* 2. Middle section: Account Overview & Recent Transactions */}
            <div className="dash-row">
                <AccountOverview />
                <RecentTransactions />
            </div>

            {/* 3. Multi-Currency Summary (Full width or split) */}
            <MultiCurrencySummary />

            {/* 4. Charts row: Cash Flow (Wide) & Spending Breakdown (Narrow) */}
            <div className="dash-row wide-left">
                <CashFlowChart />
                <SpendingBreakdown />
            </div>

            {/* 5. Bottom section: Alerts, Budgets, and Bills */}
            <div className="dash-row">
                <Alerts />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <BudgetSummary />
                    <UpcomingBills />
                </div>
            </div>
        </>
    );
}

export default Dashboard;
