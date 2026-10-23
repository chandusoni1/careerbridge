import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils';
import { connectSocket, disconnectSocket } from '../services/socket';

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

  // Manage active real-time presence connection
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      connectSocket(userId);
    } else {
      disconnectSocket();
    }
  }, [user?._id, user?.id]);

  const login = (userData, authToken) => {
    storage.setUser(userData);
    storage.setToken(authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    disconnectSocket();
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
