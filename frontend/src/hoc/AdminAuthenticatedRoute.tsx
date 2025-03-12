import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { IUser } from "../interfaces/IUser";
import localStorageService from "../services/localStorage.service";

const AuthenticatedAdminRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const userContext = useUser();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAuthentication = async () => {
      if (
        userContext.user &&
        userContext.token &&
        userContext.refreshToken &&
        userContext.user.role === "admin"
      ) {
        setIsAdmin(true);
      } else {
        const storedUser = localStorageService.getItem<IUser>("user");
        const storedAccessToken =
          localStorageService.getItem<string>("accessToken");
        const storedRefreshToken =
          localStorageService.getItem<string>("refreshToken");

        if (
          storedUser &&
          storedAccessToken &&
          storedRefreshToken &&
          storedUser.role === "admin"
        ) {
          userContext.login(storedUser, storedAccessToken, storedRefreshToken);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
      setIsCheckingAuth(false);
    };

    checkAdminAuthentication();
  }, [userContext]);

  if (isCheckingAuth) {
    return <div>Ładowanie...</div>;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return <Navigate to="/welcome-page" />;
};

export default AuthenticatedAdminRoute;
