import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const AccountsContext = createContext(null);

export const AccountsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAccounts = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/accounts/');
            setAccounts(res.data);
        } catch (error) {
            console.error("Error fetching accounts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAccounts();
        }
    }, [isAuthenticated]);

    return (
        <AccountsContext.Provider value={{
            accounts,
            loading,
            refreshAccounts: fetchAccounts
        }}>
            {children}
        </AccountsContext.Provider>
    );
};

export const useAccounts = () => {
    const context = useContext(AccountsContext);
    if (!context) {
        throw new Error('useAccounts must be used within an AccountsProvider');
    }
    return context;
};
