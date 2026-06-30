import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUser = async () => {
    const token = localStorage.getItem('doctor_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user.role === 'Doctor') {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('doctor_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Load doctor error:', err);
      localStorage.removeItem('doctor_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: loggedUser } = response.data;
        if (loggedUser.role !== 'Doctor') {
          setError('Unauthorized: Doctor portal access only.');
          return false;
        }
        localStorage.setItem('doctor_token', token);
        setUser(loggedUser);
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('doctor_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
