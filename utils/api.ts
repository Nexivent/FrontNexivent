import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';

export interface RegisterData {
  nombre: string;
  email: string;
  contrasena: string;
  telefono?: string;
  fecha_nacimiento?: string;
}

export interface LoginData {
  email: string;
  contrasena: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  correo?: string;
  Email?: string;
  Correo?: string;
  name?: string;
  Name?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  foto?: string;
  roles?: { id: number; nombre: string }[];
  rol?: string;
  idUsuario?: number;
  tipo_documento?: string;
  tipoUsuario?: string;
  rol_principal?: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;

// Funciones de autenticación
export const authApi = {
  async register(
    data: RegisterData
  ): Promise<{ success: boolean; message: string; data?: AuthResponse }> {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: result.error || result.message || 'Error al registrar usuario',
        };
      }

      if (result.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('user', JSON.stringify(result.usuario));
        }
      }

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  },

  async login(
    email: string,
    contrasena: string
  ): Promise<{ success: boolean; message: string; data?: AuthResponse }> {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, contrasena }),
      });

      const result = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: result.error || result.message || 'Credenciales inválidas',
        };
      }

      if (result.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('user', JSON.stringify(result.usuario));
        }
      }

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser(): Usuario | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
