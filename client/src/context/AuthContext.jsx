import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getProfile } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await getProfile();
          setUser(response.data.user || response.data);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await apiLogin(credentials);
    const { accessToken: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore logout API errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
