import React from 'react';
import { AccountsProvider } from '../features/accounts';
import { TransactionsProvider } from '../features/transactions';
import { BillsProvider } from '../features/bills';
import { BudgetsProvider } from '../features/budgets';
import { RewardsProvider } from '../features/rewards';
import { AlertsProvider } from '../features/alerts';

export const FeatureProviders = ({ children }) => {
    return (
        <AccountsProvider>
            <TransactionsProvider>
                <BillsProvider>
                    <BudgetsProvider>
                        <RewardsProvider>
                            <AlertsProvider>
                                {children}
                            </AlertsProvider>
                        </RewardsProvider>
                    </BudgetsProvider>
                </BillsProvider>
            </TransactionsProvider>
        </AccountsProvider>
    );
};
