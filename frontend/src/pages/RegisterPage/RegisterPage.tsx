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
import { UserType } from "../../interfaces/IUser";

const RegisterPage: React.FC = () => {
  useWebsiteTitle("Strona rejestracji");
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
      toast.error("Hasła nie są takie same");
      return;
    }

    api
      .post<ApiResponse<UserType>>("users/register", registerData)
      .then((response) => {
        if (response.data.message === "user-registered") {
          navigate("/login");
        }
      });
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.formContainer}>
        <h2>Rejestracja</h2>
        <form onSubmit={register}>
          <input
            type="email"
            placeholder="email"
            name="email"
            required
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="login"
            name="login"
            required
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="firstName"
            name="firstName"
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="lastName"
            name="lastName"
            onChange={handleInputChange}
          />
          <div className={styles.passwordContainer}>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Hasło"
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
              placeholder="Powtórz hasło"
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
          <button type="submit">Zarejestruj się</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
