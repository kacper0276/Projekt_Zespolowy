import React, { useState } from "react";
import styles from "./WipLimitEditor.module.scss";
import ActionButton from "../ActionButton/ActionButton";

interface WipLimitEditorProps {
  currentLimit: number;
  onSave: (limit: number) => void;
  onCancel: () => void;
}

const WipLimitEditor: React.FC<WipLimitEditorProps> = ({
  currentLimit,
  onSave,
  onCancel,
}) => {
  const [limit, setLimit] = useState<number>(currentLimit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLimit(isNaN(value) ? 0 : value);
  };

  const handleSave = () => {
    onSave(limit);
  };

  return (
    <div className={styles.wipEditor}>
      <div className={styles.inputGroup}>
        <input
          type="number"
          min="0"
          value={limit}
          onChange={handleChange}
          className={styles.wipInput}
          placeholder="Limit zadań"
          autoFocus
        />
        <div className={styles.actions}>
          <ActionButton onClick={handleSave} variant="success">
            <i className="bi bi-check"></i>
          </ActionButton>
          <ActionButton onClick={onCancel} variant="default">
            <i className="bi bi-x"></i>
          </ActionButton>
        </div>
      </div>
      <small className={styles.hint}>0 = brak limitu</small>
    </div>
  );
};

export default WipLimitEditor;