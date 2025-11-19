'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, Usuario, RegisterData } from '@utils/api';

interface UserContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, contrasena: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, contrasena: string) => {
    setLoading(true);
    try {
      const result = await authApi.login(email, contrasena);

      if (result.success && result.data) {
        setUser(result.data.usuario);
      }

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error inesperado en login',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await authApi.register(data);

      if (result.success && result.data) {
        setUser(result.data.usuario);
      }

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      console.error('Error en register:', error);
      return {
        success: false,
        message: 'Error inesperado en registro',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
