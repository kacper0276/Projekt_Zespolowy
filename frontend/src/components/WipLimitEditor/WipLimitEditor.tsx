import React, { useState } from 'react';
import styles from './WipLimitEditor.module.scss';

interface WipLimitEditorProps {
  currentLimit: number;
  onSave: (newLimit: number) => void;
  onCancel: () => void;
}

const WipLimitEditor: React.FC<WipLimitEditorProps> = ({
  currentLimit,
  onSave,
  onCancel
}) => {
  const [tempWipLimit, setTempWipLimit] = useState(currentLimit.toString());

  const handleWipLimitChange = () => {
    const newLimit = parseInt(tempWipLimit, 10);
    if (isNaN(newLimit) || newLimit < 0) {
      // Could add toast notification here
      return;
    }
    
    onSave(newLimit);
  };

  return (
    <div className={styles.wipLimitEditor}>
      <input
        type="number"
        min="0"
        value={tempWipLimit}
        onChange={(e) => setTempWipLimit(e.target.value)}
        className={styles.wipLimitInput}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleWipLimitChange();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className={styles.wipLimitButtons}>
        <button 
          onClick={handleWipLimitChange} 
          className={styles.confirmWipButton} 
          title="Zapisz"
        >
          <i className="bi bi-check-lg"></i>
        </button>
        <button 
          onClick={onCancel} 
          className={styles.cancelWipButton}
          title="Anuluj"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default WipLimitEditor;