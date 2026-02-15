import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const RewardsContext = createContext(null);

export const RewardsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRewards = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/bills/rewards');
            setRewards(res.data);
        } catch (error) {
            console.error("Error fetching rewards", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchRewards();
        }
    }, [isAuthenticated]);

    return (
        <RewardsContext.Provider value={{
            rewards,
            loading,
            refreshRewards: fetchRewards
        }}>
            {children}
        </RewardsContext.Provider>
    );
};

export const useRewards = () => {
    const context = useContext(RewardsContext);
    if (!context) {
        throw new Error('useRewards must be used within a RewardsProvider');
    }
    return context;
};
