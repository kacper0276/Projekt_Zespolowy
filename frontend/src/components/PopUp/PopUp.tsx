import React from "react";
import styles from "./PopUp.module.scss";

interface PopUpProps {
  header: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
}

const PopUp: React.FC<PopUpProps> = ({ header, body, footer }) => {
  return (
    <div className={styles.popup}>
      <div className={styles.popup_inner}>
        <div className={styles.header}>{header}</div>
        <div className={styles.body}>{body}</div>
        <div className={styles.footer}>{footer}</div>
      </div>
    </div>
  );
};

export default PopUp;
