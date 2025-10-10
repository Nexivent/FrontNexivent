"use client";
import React, { createContext, useContext, useState } from "react";

// 1️⃣ Tipo de los datos de usuario
export type User = {
  nombre: string;
  apellido: string;
  correo: string;
  foto: string;
};

// 2️⃣ Crea el contexto
const UserContext = createContext<{
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
} | null>(null);

// 3️⃣ Proveedor del contexto
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    nombre: "Mario",
    apellido: "Bros",
    correo: "mario_bros@gmail.com",
    foto: "https://www.desura.games/files/images/49/49eee8a55fe13133dc5d8ae33106c74b.jpg",
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 4️⃣ Hook para usar el contexto en cualquier parte
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de un UserProvider");
  return context;
};
