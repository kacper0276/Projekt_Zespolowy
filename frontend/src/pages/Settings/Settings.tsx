import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import styles from "./Settings.module.scss";
import { useApiJson } from "../../config/api";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { toast } from "react-toastify";

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    null
  );

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

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "background"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        if (type === "profile") {
          setProfileImage(reader.result);
          setProfilePreview(reader.result);
        } else {
          setBackgroundImage(reader.result);
          setBackgroundPreview(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileImage && !backgroundImage) {
      return;
    }
    try {
      await api.patch("/users/update-images", {
        email: user?.email,
        profileImage,
        backgroundImage,
      });
      toast.success(t("images-updated-successfully"));
    } catch {
      toast.error(t("failed-to-update-images"));
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
          <h3>{t("profile-and-background-image")}</h3>
          <form onSubmit={handleImageSubmit} className={styles.imageForm}>
            <div className={styles.imageGroup}>
              <label>{t("profile-image")}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "profile")}
              />
              {profilePreview && (
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className={styles.imagePreview}
                />
              )}
            </div>
            <div className={styles.imageGroup}>
              <label>{t("background-image")}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "background")}
              />
              {backgroundPreview && (
                <img
                  src={backgroundPreview}
                  alt="Background preview"
                  className={styles.imagePreview}
                />
              )}
            </div>
            <button type="submit" className={styles.submitButton}>
              {t("save-images")}
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
