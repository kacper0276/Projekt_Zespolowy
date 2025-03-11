import React, { useState } from "react";
import styles from "./RegisterPage.module.scss";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { RegisterData } from "../../types/auth.types";
import { Role } from "../../enums/role.enum";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useApiJson } from "../../config/api";

const RegisterPage: React.FC = () => {
  useWebsiteTitle("Strona rejestracji");
  const navigate = useNavigate();
  const api = useApiJson();

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

    api.post("users/register", registerData).then((response) => {
      console.log(response);
      if (response.data.message === "user-registered") {
        navigate("/login");
      }
    });

    console.log(registerData);
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
          <button type="submit">Zarejestruj się</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
