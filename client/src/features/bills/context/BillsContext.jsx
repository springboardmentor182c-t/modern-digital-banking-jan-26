import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const BillsContext = createContext(null);

export const BillsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBills = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/bills/');
            setBills(res.data);
        } catch (error) {
            console.error("Error fetching bills", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchBills();
        }
    }, [isAuthenticated]);

    return (
        <BillsContext.Provider value={{
            bills,
            loading,
            refreshBills: fetchBills
        }}>
            {children}
        </BillsContext.Provider>
    );
};

export const useBills = () => {
    const context = useContext(BillsContext);
    if (!context) {
        throw new Error('useBills must be used within a BillsProvider');
    }
    return context;
};
