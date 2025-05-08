import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import styles from "./Settings.module.scss";
import { useApiJson } from "../../config/api";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  useWebsiteTitle(t("settings"));
  const { user } = useUser();
  const api = useApiJson();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setError("");
    setSuccess("");

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t("all-fields-required"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwords-do-not-match"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("password-too-short"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/users/change-password", {
        oldPassword: currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
        email: user?.email,
      });

      if (response.status === 200) {
        setSuccess(t("password-changed-successfully"));
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(t("failed-to-change-password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsCard}>
        <div className={styles.headerSection}>
          <h2>{t("settings")}</h2>
          <p className={styles.subtitle}>{t("manage-your-account-settings")}</p>
        </div>

        <div className={styles.settingSection}>
          <h3>{t("change-password")}</h3>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✓</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.passwordForm}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">{t("current-password")}</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.formControl}
                placeholder={t("enter-current-password")}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword">{t("new-password")}</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.formControl}
                placeholder={t("enter-new-password")}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">
                {t("confirm-new-password")}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.formControl}
                placeholder={t("confirm-new-password")}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("changing") : t("change-password")}
            </button>
          </form>
        </div>

        <div className={styles.settingSection}>
          <h3>{t("account-information")}</h3>
          <div className={styles.accountInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t("email")}:</span>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
