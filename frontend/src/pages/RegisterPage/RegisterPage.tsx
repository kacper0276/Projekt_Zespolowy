import React, { useRef, useState } from "react";
import styles from "./RegisterPage.module.scss";
import progressBarStyles from "../../styles/progressBar.module.scss";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { RegisterData } from "../../types/auth.types";
import { Role } from "../../enums/role.enum";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useApiJson } from "../../config/api";
import { handleChange } from "../../helpers/ProgressBarRegister";
import { ApiResponse } from "../../types/api.types";
import { IUser } from "../../interfaces/IUser";
import { useTranslation } from "react-i18next";

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  useWebsiteTitle(t("register-page"));
  const navigate = useNavigate();
  const api = useApiJson();
  const bars = useRef<HTMLDivElement>(null);
  const strengthDiv = useRef<HTMLDivElement>(null);

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [repeatedPasswordVisible, setRepeatedPasswordVisible] =
    useState<boolean>(false);
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    login: "",
    password: "",
    repeatedPassword: "",
    role: Role.USER,
    firstName: "",
    lastName: "",
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleRepeatedPasswordVisibility = () => {
    setRepeatedPasswordVisible(!repeatedPasswordVisible);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prevState) => ({
      ...prevState,
      [name]: value ?? "",
    }));
  };

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (registerData.password !== registerData.repeatedPassword) {
      toast.error(t("passwords-do-not-match"));
      return;
    }

    api
      .post<ApiResponse<IUser>>("users/register", registerData)
      .then((response) => {
        if (response.data.message === "user-registered") {
          navigate("/login");
        }
      });
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.formContainer}>
        <h2>{t("register")}</h2>
        <form onSubmit={register}>
          <input
            type="email"
            placeholder={t("email")}
            name="email"
            required
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder={t("login")}
            name="login"
            required
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder={t("first-name")}
            name="firstName"
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder={t("last-name")}
            name="lastName"
            onChange={handleInputChange}
          />
          <div className={styles.passwordContainer}>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder={t("password")}
              name="password"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleInputChange(e);
                handleChange(e.target.value, bars, strengthDiv);
              }}
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
          <div className={styles.passwordContainer}>
            <input
              type={repeatedPasswordVisible ? "text" : "password"}
              placeholder={t("repeat-password")}
              name="repeatedPassword"
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              onClick={toggleRepeatedPasswordVisibility}
              className={styles.toggleButton}
            >
              {repeatedPasswordVisible ? "🙈" : "👁️"}
            </button>
          </div>

          <div id={`${progressBarStyles.bars}`} ref={bars}>
            <div></div>
          </div>
          <div
            className={`${progressBarStyles.strength}`}
            ref={strengthDiv}
          ></div>
          <button type="submit">{t("sign-up")}</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
