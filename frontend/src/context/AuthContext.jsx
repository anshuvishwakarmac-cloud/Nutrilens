import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';
import { getProfile as getProfileApi } from '../api/userApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nutrilens_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nutrilens_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await getProfileApi();
          setUser(profile);
          localStorage.setItem('nutrilens_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Failed to sync user profile:', err);
          logoutUser();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const loginUser = async (credentials) => {
    const res = await loginApi(credentials);
    setToken(res.token);
    setUser(res);
    localStorage.setItem('nutrilens_token', res.token);
    localStorage.setItem('nutrilens_user', JSON.stringify(res));
    return res;
  };

  const registerUser = async (data) => {
    const res = await registerApi(data);
    setToken(res.token);
    setUser(res);
    localStorage.setItem('nutrilens_token', res.token);
    localStorage.setItem('nutrilens_user', JSON.stringify(res));
    return res;
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nutrilens_token');
    localStorage.removeItem('nutrilens_user');
  };

  const updateUserContext = (updatedUserData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedUserData };
      localStorage.setItem('nutrilens_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        loginUser,
        registerUser,
        logoutUser,
        updateUserContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
