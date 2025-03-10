import React, { useState } from "react";
import styles from "./LoginPage.module.scss";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useApiJson } from "../../config/api";
import { LoginData } from "../../types/auth.types";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "../../types/api.types";

const LoginPage: React.FC = () => {
  useWebsiteTitle("Strona logowania");
  const api = useApiJson();
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

    api.post<ApiResponse<any>>("users/login", loginData).then((response) => {
      console.log(response);

      if (response.data.message === "successfully-logged-in") {
        navigate("/");
      }
    });
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
        <h2>Logowanie</h2>
        <form onSubmit={login}>
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            name="email"
            required
            onChange={handleInputChange}
          />
          <div className={styles.passwordContainer}>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Hasło"
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
          <button type="submit">Zaloguj się</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
