import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wholesale_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync profile validation state on startup
  useEffect(() => {
    const bootstrapAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error('Session validation failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      localStorage.setItem('wholesale_token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed, check credentials!';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const data = res.data;
      localStorage.setItem('wholesale_token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed, try again.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('wholesale_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
