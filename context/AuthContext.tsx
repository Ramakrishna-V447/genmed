
import React, { createContext, useContext, useState, ReactNode, PropsWithChildren } from 'react';
import { AuthState, User } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, name: string) => {
    // Simulate login & Role assignment
    // In a real app, this would come from the backend token
    const role = email.toLowerCase() === 'admin@upchar.com' ? 'admin' : 'user';
    setUser({ email, name, role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
