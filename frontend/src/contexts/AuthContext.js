import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in on initial load
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            // If we have a stored user, use it immediately for better UX
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Error parsing stored user data', e);
                    localStorage.removeItem('user');
                }
            }
            
            // Then verify the token and refresh user data in the background
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    if (response.data.status === 'success') {
                        const userData = response.data.data.user;
                        // Store user data in localStorage
                        const { id, firstName, lastName, email, phoneNumber } = userData;
                        const userToStore = {
                            id,
                            firstName,
                            lastName,
                            email,
                            phoneNumber
                        };
                        localStorage.setItem('user', JSON.stringify(userToStore));
                        setUser(userToStore);
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error checking auth:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        // Store user data in localStorage
        const { id, firstName, lastName, email, phoneNumber } = userData;
        localStorage.setItem('user', JSON.stringify({
            id,
            firstName,
            lastName,
            email,
            phoneNumber
        }));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const updateUser = (userData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...userData
        }));
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
