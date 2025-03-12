import React, { useEffect } from "react";
import styles from "./ActivateAccount.module.scss";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useParams, useNavigate } from "react-router-dom";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { toast } from "react-toastify";

const ActivateAccount: React.FC = () => {
  useWebsiteTitle("Activate Account");
  const params = useParams();
  const navigate = useNavigate();
  const apiJson = useApiJson();

  const activateAccount = async () => {
    try {
      const res = await apiJson.patch<ApiResponse<string>>(
        `users/activate-account`,
        {},
        {
          params: {
            userEmail: params.userEmail,
          },
        }
      );

      toast.success(res.data.message);

      if (res.status === 200) {
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(err.response?.data.message || err.message);
    }
  };

  useEffect(() => {
    activateAccount();
  }, []);

  return (
    <div className={styles.mainContainer}>
      <h1>Activate Account</h1>
      <p>Your account is currently activated.</p>
    </div>
  );
};

export default ActivateAccount;
