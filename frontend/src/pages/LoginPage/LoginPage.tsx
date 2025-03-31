import React, { useState } from "react";
import styles from "./LoginPage.module.scss";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useApiJson } from "../../config/api";
import { LoginData } from "../../types/auth.types";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "../../types/api.types";
import { useUser } from "../../context/UserContext";
import localStorageService from "../../services/localStorage.service";
import { toast } from "react-toastify";
import webSocketService from "../../services/webSocket.service";
import { useTranslation } from "react-i18next";

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  useWebsiteTitle(t("sign-in-page"));
  const api = useApiJson();
  const userContext = useUser();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await api.post<ApiResponse<any>>("auth/login", loginData);

      const loginDataRes = res.data.data;

      localStorageService.setItem("user", loginDataRes.user);
      localStorageService.setItem("accessToken", loginDataRes.accessToken);
      localStorageService.setItem("refreshToken", loginDataRes.refreshToken);

      userContext.login(
        loginDataRes.user,
        loginDataRes.accessToken,
        loginDataRes.refreshToken
      );

      toast.success(res.data.message);

      const userId = loginDataRes.user.id;
      webSocketService.connect(userId);

      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data.message || err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prevState) => ({
      ...prevState,
      [name]: value ?? "",
    }));
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.formContainer}>
        <h2>{t("signing-in")}</h2>
        <form onSubmit={login}>
          <input
            type="email"
            placeholder={t("email")}
            name="email"
            required
            onChange={handleInputChange}
          />
          <div className={styles.passwordContainer}>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder={t("password")}
              name="password"
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={styles.toggleButton}
            >
              {passwordVisible ? "🙈" : "👁️"}
            </button>
          </div>
          <button type="submit">{t("sign-in")}</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
