import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const BudgetsContext = createContext(null);

export const BudgetsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBudgets = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const today = new Date();
            const res = await api.get('/budgets/', {
                params: { month: today.getMonth() + 1, year: today.getFullYear() }
            });
            setBudgets(res.data);
        } catch (error) {
            console.error("Error fetching budgets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchBudgets();
        }
    }, [isAuthenticated]);

    return (
        <BudgetsContext.Provider value={{
            budgets,
            loading,
            refreshBudgets: fetchBudgets
        }}>
            {children}
        </BudgetsContext.Provider>
    );
};

export const useBudgets = () => {
    const context = useContext(BudgetsContext);
    if (!context) {
        throw new Error('useBudgets must be used within a BudgetsProvider');
    }
    return context;
};
