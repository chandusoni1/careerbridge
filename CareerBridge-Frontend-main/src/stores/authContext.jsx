import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getUser());
  const [token, setToken] = useState(() => storage.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = storage.getUser();
    const savedToken = storage.getToken();
    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    storage.setUser(userData);
    storage.setToken(authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData) => {
    storage.setUser(userData);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, updateUser, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
