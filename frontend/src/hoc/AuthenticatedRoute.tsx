import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { UserType } from "../interfaces/IUser";
import localStorageService from "../services/localStorage.service";

const AuthenticatedRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const userContext = useUser();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (userContext.user && userContext.token && userContext.refreshToken) {
        setIsAuthenticated(true);
      } else {
        const storedUser = localStorageService.getItem<UserType>("user");
        const storedAccessToken =
          localStorageService.getItem<string>("accessToken");
        const storedRefreshToken =
          localStorageService.getItem<string>("refreshToken");

        if (storedUser && storedAccessToken && storedRefreshToken) {
          userContext.login(storedUser, storedAccessToken, storedRefreshToken);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [userContext]);

  if (isCheckingAuth) {
    return <div>Ładowanie...</div>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <Navigate to="/welcome-page" />;
};

export default AuthenticatedRoute;
