import React, { useState } from 'react';
import styles from '../../pages/KanbanBoard/KanbanBoard.module.scss';
import WipLimitEditor from '../WipLimitEditor/WipLimitEditor';

interface RowHeaderProps {
  rowId: string;
  rowTitle: string;
  wipLimit: number;
  handleDeleteRow: (rowId: string) => void;
  isDefaultRow: boolean;
  onWipLimitUpdate: (newWipLimit: number) => void;
}

const RowHeader: React.FC<RowHeaderProps> = ({
  rowId,
  rowTitle,
  wipLimit,
  handleDeleteRow,
  isDefaultRow,
  onWipLimitUpdate
}) => {
  const [isEditingWipLimit, setIsEditingWipLimit] = useState(false);
 
  const handleWipLimitSave = (newWipLimit: number) => {
    setIsEditingWipLimit(false);
    
    // Call the parent function to update WIP limit in database
    if (onWipLimitUpdate) {
      onWipLimitUpdate(newWipLimit);
    }
  };
 
  const handleWipLimitCancel = () => {
    setIsEditingWipLimit(false);
  };
 
  const confirmDeleteRow = () => {
    if (window.confirm(
      `Czy na pewno chcesz usunąć wiersz "${rowTitle}"? Ta operacja jest nieodwracalna.`
    )) {
      handleDeleteRow(rowId);
    }
  };

  return (
    <div className={styles.rowHeader}>
      <div className={styles.rowTitle}>{rowTitle}</div>
     
      <div className={styles.rowHeaderActions}>
        {isEditingWipLimit ? (
          <WipLimitEditor
            currentLimit={wipLimit}
            onSave={handleWipLimitSave}
            onCancel={handleWipLimitCancel}
          />
        ) : (
          <div
            className={styles.wipLimitDisplay}
            onClick={() => setIsEditingWipLimit(true)}
            title="Kliknij, aby edytować limit zadań"
          >
            <span>WIP: {wipLimit === 0 ? "Brak" : wipLimit}</span>
            <i className="bi bi-pencil-fill ms-2"></i>
          </div>
        )}
       
        {!isDefaultRow && (
          <button
            onClick={confirmDeleteRow}
            className={styles.deleteRowButton}
            title="Usuń wiersz"
          >
            <i className="bi bi-trash-fill"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default RowHeader;