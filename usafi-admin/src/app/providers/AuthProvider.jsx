import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('usafi_admin_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: 'usr_admin_01',
      name: 'Super Admin',
      email: 'admin@usafi.com',
      role: 'Super Admin',
      avatar: null,
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('usafi_access_token') || true);
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('usafi_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('usafi_admin_user');
    }
  }, [user]);

  const login = async (credentials) => {
    // Prepared for real backend API call
    const mockUser = {
      id: 'usr_admin_01',
      name: 'Super Admin',
      email: credentials.email || 'admin@usafi.com',
      role: 'Super Admin',
    };
    localStorage.setItem('usafi_access_token', 'mock_jwt_access_token_usafi_2026');
    setUser(mockUser);
    setIsAuthenticated(true);
    return mockUser;
  };

  const logout = () => {
    localStorage.removeItem('usafi_access_token');
    localStorage.removeItem('usafi_admin_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
