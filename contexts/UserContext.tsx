'use client';
import React, { createContext, useContext, useState } from 'react';

// 1️⃣ Tipo de los datos de usuario
export type User = {
  idUsuario: number;
  nombre: string;
  apellido: string;
  ndocumento: string;
  tipo_documento: string;
  correo: string;
  foto: string;
  telefono: string;
  idRolUsuarios: number;
};

// 2️⃣ Crea el contexto
const UserContext = createContext<{
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
} | null>(null);

// 3️⃣ Proveedor del contexto
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    idUsuario: 1,
    nombre: 'Mario',
    apellido: 'Bros',
    ndocumento: '123456789',
    tipo_documento: 'DNI',
    correo: 'luisaguigar0408@gmail.com',
    foto: 'https://www.desura.games/files/images/49/49eee8a55fe13133dc5d8ae33106c74b.jpg',
    telefono: '123-456-7890',
    idRolUsuarios: 2,
  });

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

// 4️⃣ Hook para usar el contexto en cualquier parte
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de un UserProvider');
  return context;
};
