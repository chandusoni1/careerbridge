import { useState } from 'react';
import { useAuthContext } from '../../../stores';
import { authApi } from '../auth.api';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, updateUser, setUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(credentials);
      login(data.user, data.token);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.signup(userData);
      return data;
    } catch (err) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    signup: handleSignup,
    logout,
    updateUser,
    setUser,
  };
};

export default useAuth;
