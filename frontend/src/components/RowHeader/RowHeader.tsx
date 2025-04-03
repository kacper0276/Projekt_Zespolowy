import React, { useState } from 'react';
import styles from '../../pages/KanbanBoard/KanbanBoard.module.scss';
import WipLimitEditor from '../WipLimitEditor/WipLimitEditor';
import { useApiJson } from "../../config/api";

interface RowHeaderProps {
  rowId: string;
  rowTitle: string;
  wipLimit: number;
  handleDeleteRow: (rowId: string) => void;
  isDefaultRow: boolean;
  onWipLimitUpdate: (newWipLimit: number) => void;
  currentTaskCount?: number; 
  rowDbId?: number;  
}

const RowHeader: React.FC<RowHeaderProps> = ({
  rowId,
  rowTitle,
  wipLimit,
  handleDeleteRow,
  isDefaultRow,
  onWipLimitUpdate,
  currentTaskCount = 0,
  rowDbId
}) => {
  const [isEditingWipLimit, setIsEditingWipLimit] = useState(false);
  const api = useApiJson();
 
  const isLimitReached = wipLimit > 0 && currentTaskCount >= wipLimit;
 
  const handleWipLimitSave = (newWipLimit: number) => {
    setIsEditingWipLimit(false);
   
    if (rowDbId) {
      const updateData = { newLimit: newWipLimit }; // Changed from maxTasks to newLimit
      console.log(`Updating WIP limit for row ID ${rowDbId}:`, {
        endpoint: `rows/edit-wip-limit/${rowDbId}`,
        data: updateData,
        previousLimit: wipLimit,
        newLimit: newWipLimit
      });
     
      api.patch(`rows/edit-wip-limit/${rowDbId}`, updateData)
        .then(response => {
          console.log('WIP limit update response:', response);
        })
        .catch(error => {
          console.error('Failed to update WIP limit in database:', error);
        });
    }
   
    // Call the parent function to update WIP limit in state
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
        <span className={`badge ${styles.taskCount} ${
          isLimitReached ? styles.limitReached : ""
        }`}>
          {currentTaskCount}
          {wipLimit > 0 && `/${wipLimit}`}
        </span>
       
        {isEditingWipLimit ? (
          <WipLimitEditor
            currentLimit={wipLimit}
            onSave={handleWipLimitSave}
            onCancel={handleWipLimitCancel}
          />
        ) : (
          <div
            className={`${styles.wipLimitDisplay} ${
              isLimitReached ? styles.limitReached : ""
            }`}
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