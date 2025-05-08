import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./BoardHeader.module.scss";
import { useTranslation } from "react-i18next";

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

const BoardHeader: React.FC<BoardHeaderProps> = ({
  boardData,
  setBoardData,
  api,
  params,
}) => {
  const { t } = useTranslation();
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
      toast.error(t("empty-table"));
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
        toast.success(t("table-name-update"));
      }
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating table name:", error);
      toast.error(t("table-name-update-error"));
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
            type={"text"}
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
              title={t("save")}
            ></i>
            <i
              className="bi bi-x-lg"
              onClick={handleCancelEdit}
              title={t("cancel")}
            ></i>
          </div>
        </div>
      ) : (
        <div className={styles.boardTitle}>
          <h1>{boardData?.tableName || t("kanban-table")}</h1>
          <i
            className="bi bi-pencil"
            onClick={handleEditTableName}
            title={t("edit-table-name")}
          ></i>
        </div>
      )}
    </div>
  );
};

export default BoardHeader;
