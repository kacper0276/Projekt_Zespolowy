import React from "react";
import styles from "./PopUp.module.scss";

interface PopUpProps {
  header: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
  onClose?: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ header, body, footer, onClose }) => {
  // Close on ESC key press
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div className={styles.popup}>
      <div className={styles.popup_inner}>
        <div className={styles.header}>
          {header}
          {onClose && (
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              ✕
            </button>
          )}
        </div>
        <div className={styles.body}>{body}</div>
        <div className={styles.footer}>{footer}</div>
      </div>
    </div>
  );
};

export default PopUp;