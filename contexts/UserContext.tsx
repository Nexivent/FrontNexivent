'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, Usuario, RegisterData } from '@utils/api';
import { set } from 'zod';


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
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('auth_token');
    const storedExpiry = localStorage.getItem('token_expiry');
    if (storedUser && storedUser !== 'undefined' && storedToken && storedToken !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          if (storedExpiry && Date.now() < parseInt(storedExpiry)) {
            setUser(JSON.parse(storedUser));
            console.log('Usuario cargado desde localStorage');
          } else {
            console.log('Token expirado, limpiando sesion');
            logout();
          }
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    } else {
      if (storedUser === 'undefined') localStorage.removeItem('user');
      if (storedToken === 'undefined') localStorage.removeItem('auth_token');
    }
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

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      if (token) {
        await fetch('http://localhost:8098/logout', {
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
