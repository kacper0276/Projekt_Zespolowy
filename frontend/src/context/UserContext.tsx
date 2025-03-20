import React, { createContext, useState, useContext, useEffect } from "react";
import { IUser } from "../interfaces/IUser";
import axios from "axios";
import { useLocation } from "react-router-dom";
import localStorageService from "../services/localStorage.service";
import webSocketService from "../services/webSocket.service";

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
  const location = useLocation();
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const login = (userData: IUser, token: string, refreshToken: string) => {
    setUser(userData);
    setToken(token);
    setRefreshToken(refreshToken);
  };

  const logout = () => {
    localStorageService.clear();
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  const updateTokens = (newToken: string, newRefreshToken: string) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  };

  useEffect(() => {
    if (!token || !refreshToken) {
      updateTokens(
        localStorageService.getItem("accessToken") ?? "",
        localStorageService.getItem("refreshToken") ?? ""
      );
    }

    const fetchUser = async () => {
      if (!user && token) {
        try {
          const response = await axios.get(
            "http://localhost:3000/api/auth/me",
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          setUser(response.data.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };

    fetchUser();
  }, [token, location.pathname]);

  useEffect(() => {
    const user = localStorageService.getItem("user") as IUser;
    if (user) {
      webSocketService.connect(user?.id + "");
    }
  }, [location]);

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
