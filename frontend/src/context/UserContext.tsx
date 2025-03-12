import React, { createContext, useState, useContext } from "react";
import { IUser } from "../interfaces/IUser";

interface UserContextType {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  login: (userData: IUser, token: string, refreshToken: string) => void;
  logout: () => void;
  updateTokens: (newToken: string, newRefreshToken: string) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const login = (userData: IUser, token: string, refreshToken: string) => {
    setUser(userData);
    setToken(token);
    setRefreshToken(refreshToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  const updateTokens = (newToken: string, newRefreshToken: string) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  };

  return (
    <UserContext.Provider
      value={{ user, token, refreshToken, login, logout, updateTokens }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
