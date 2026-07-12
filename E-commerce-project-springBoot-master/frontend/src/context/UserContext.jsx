import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (username, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            setUser(data);
            return { success: true };
        } else {
            const errData = await res.json();
            return { success: false, message: errData.message || 'Login failed' };
        }
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
    };

    const register = async (username, email, password, address) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, address })
        });
        if (res.ok) {
            const data = await res.json();
            // Automatically log them in by fetching profile
            await login(username, password);
            return { success: true };
        } else {
            const errData = await res.json();
            return { success: false, message: errData.message || 'Registration failed' };
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout, register, refreshUser: checkSession }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
