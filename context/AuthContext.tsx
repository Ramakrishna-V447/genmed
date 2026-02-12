
import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { AuthState, User } from '../types';
import { db } from '../services/db';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from session (basic persistence for reload)
  useEffect(() => {
      const stored = sessionStorage.getItem('medigen_session_user');
      if (stored) {
          try {
              setUser(JSON.parse(stored));
          } catch (e) {
              console.error("Session parse error", e);
          }
      }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const authenticatedUser = await db.authenticateUser(email, password);
        setUser(authenticatedUser);
        sessionStorage.setItem('medigen_session_user', JSON.stringify(authenticatedUser));
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
          const newUser = await db.registerUser(name, email, password);
          setUser(newUser);
          sessionStorage.setItem('medigen_session_user', JSON.stringify(newUser));
          return { success: true };
      } catch (error) {
          return { success: false, error: (error as Error).message };
      }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('medigen_session_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
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
