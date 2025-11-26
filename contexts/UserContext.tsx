'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, Usuario, RegisterData } from '@utils/api';

interface UserContextType {
  user: Usuario | null;
  setUser: React.Dispatch<React.SetStateAction<Usuario | null>>;
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
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('auth_token');

      if (storedUser && storedUser !== 'undefined' && storedToken && storedToken !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        console.log('ℹ️ [CONTEXT] No hay sesión guardada');
      }
    } catch (error) {
      console.error('💥 [CONTEXT] Error al cargar el usuario desde localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, contrasena: string) => {
    setLoading(true);
    try {
      const result = await authApi.login(email, contrasena);

      if (result.success && result.data) {
        setUser(result.data.usuario);
        localStorage.setItem('user', JSON.stringify(result.data.usuario));
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('token_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      } else {
        console.error('❌ [CONTEXT] Error en login:', result.message);
      }
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      console.error('💥 [CONTEXT] Error en login:', error);
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

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      if (token) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión en el backend:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('verification_user_id');
      sessionStorage.removeItem('verification_email');
      sessionStorage.removeItem('verification_code');
      sessionStorage.removeItem('verification_expiry');
      sessionStorage.removeItem('verification_nombre');

      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
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
