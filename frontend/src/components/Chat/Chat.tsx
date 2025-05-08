import React from "react";
import styles from "./Chat.module.scss";
import { useTranslation } from "react-i18next";

const Chat: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.chat}>
      <h1>{t("chat")}</h1>
      <p>{t("chat-notif1")}.</p>
      <p>{t("chat-notif2")}.</p>
      <p>{t("chat-notif3")}.</p>
    </div>
  );
};

export default Chat;
