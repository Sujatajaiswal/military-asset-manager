import React, { createContext, useContext, useState } from "react";

export type Role = "ADMIN" | "COMMANDER" | "LOGISTICS";

type AuthContextType = {
  role: Role;
  setRole: (role: Role) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<Role>("ADMIN");

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};
