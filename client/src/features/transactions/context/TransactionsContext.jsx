import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const TransactionsContext = createContext(null);

export const TransactionsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/transactions/');
            setTransactions(res.data);
        } catch (error) {
            console.error("Error fetching transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTransactions();
        }
    }, [isAuthenticated]);

    return (
        <TransactionsContext.Provider value={{
            transactions,
            loading,
            refreshTransactions: fetchTransactions
        }}>
            {children}
        </TransactionsContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionsContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionsProvider');
    }
    return context;
};
