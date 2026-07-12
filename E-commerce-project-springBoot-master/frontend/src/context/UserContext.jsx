import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                logout();
            }
        } catch (err) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Global Fetch Interceptor Setup
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            // Intercept internal api calls
            if (typeof url === 'string' && url.startsWith('/api/')) {
                let headers = options.headers || {};
                const currentToken = sessionStorage.getItem('accessToken');
                
                if (currentToken) {
                    headers = {
                        ...headers,
                        'Authorization': `Bearer ${currentToken}`
                    };
                }
                
                let res = await originalFetch(url, { ...options, headers });
                
                // If unauthorized, attempt to perform automatic silent token refresh
                if (res.status === 401 && !url.includes('/api/auth/refresh')) {
                    const storedRefreshToken = localStorage.getItem('refreshToken');
                    if (storedRefreshToken) {
                        try {
                            const refreshRes = await originalFetch('/api/auth/refresh', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ refreshToken: storedRefreshToken })
                            });
                            if (refreshRes.ok) {
                                const data = await refreshRes.json();
                                sessionStorage.setItem('accessToken', data.accessToken);
                                localStorage.setItem('refreshToken', data.refreshToken);
                                
                                // Retry original request with new token
                                headers = {
                                    ...headers,
                                    'Authorization': `Bearer ${data.accessToken}`
                                };
                                return await originalFetch(url, { ...options, headers });
                            } else {
                                // Silent refresh failed (refresh token expired) -> log out
                                sessionStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                setUser(null);
                            }
                        } catch (e) {
                            sessionStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            setUser(null);
                        }
                    }
                }
                return res;
            }
            return originalFetch(url, options);
        };

        checkSession();

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    const login = async (username, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            setUser({
                id: data.id,
                username: data.username,
                email: data.email,
                role: data.role,
                address: data.address
            });
            return { success: true };
        } else {
            const errData = await res.json();
            return { success: false, message: errData.message || 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {}
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const register = async (username, email, password, address) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, address })
        });
        if (res.ok) {
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

export default UserContext;
export const useUser = () => useContext(UserContext);
