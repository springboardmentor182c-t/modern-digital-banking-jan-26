import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const AlertsContext = createContext(null);

export const AlertsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/analytics/alerts');
            setAlerts(res.data);
        } catch (error) {
            console.error("Error fetching alerts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAlerts();
        }
    }, [isAuthenticated]);

    return (
        <AlertsContext.Provider value={{
            alerts,
            loading,
            refreshAlerts: fetchAlerts
        }}>
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlerts = () => {
    const context = useContext(AlertsContext);
    if (!context) {
        throw new Error('useAlerts must be used within an AlertsProvider');
    }
    return context;
};
