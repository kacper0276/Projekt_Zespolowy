import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styles from './BoardHeader.module.scss';

interface BoardHeaderProps {
  boardData: {
    tableName: string;
  };
  setBoardData: (data: { tableName: string }) => void;
  api: {
    patch: (url: string, data: any) => Promise<{ data: { data: any } }>;
  };
  params: {
    id: string;
  };
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ boardData, setBoardData, api, params }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTableName, setNewTableName] = useState(boardData?.tableName || "");

  const handleEditTableName = () => {
    setIsEditingTitle(true);
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setNewTableName(boardData?.tableName || "");
  };

  const handleSaveTableName = async () => {
    if (!newTableName.trim()) {
      toast.error("Nazwa tablicy nie może być pusta!");
      return;
    }

    try {
      const res = await api.patch(`kanban/change-table-name`, {
        id: params.id,
        tableName: newTableName.trim(),
      });
      
      if (res.data && res.data.data) {
        setBoardData({
          ...boardData,
          tableName: newTableName.trim(),
        });
        toast.success("Nazwa tablicy została zaktualizowana!");
      }
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating table name:", error);
      toast.error("Nie udało się zaktualizować nazwy tablicy.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTableName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className={styles.boardHeader}>
      {isEditingTitle ? (
        <div className={styles.editTitleContainer}>
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            className={styles.editTitleInput}
          />
          <div className={styles.editTitleActions}>
            <i
              className="bi bi-check-lg"
              onClick={handleSaveTableName}
              title="Zapisz"
            ></i>
            <i
              className="bi bi-x-lg"
              onClick={handleCancelEdit}
              title="Anuluj"
            ></i>
          </div>
        </div>
      ) : (
        <div className={styles.boardTitle}>
          <h1>{boardData?.tableName || "Tablica Kanban"}</h1>
          <i
            className="bi bi-pencil"
            onClick={handleEditTableName}
            title="Edytuj nazwę tablicy"
          ></i>
        </div>
      )}
    </div>
  );
};

export default BoardHeader;