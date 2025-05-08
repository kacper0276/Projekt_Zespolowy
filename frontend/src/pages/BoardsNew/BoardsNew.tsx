import React, { useEffect, useState } from "react";
import styles from "./BoardsNew.module.scss";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { IKanban } from "../../interfaces/IKanban";
import { IUser } from "../../interfaces/IUser";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { toast } from "react-toastify";
import Multiselect from "multiselect-react-dropdown";
import { IStatus } from "../../interfaces/IStatus";
import { IColumnEntity } from "../../interfaces/IColumnEntity";
// Import Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";
import { IRow } from "../../interfaces/IRow";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BoardsNew: React.FC = () => {
  const { t } = useTranslation();
  useWebsiteTitle(t("create-new-board"));
  const api = useApiJson();
  const navigate = useNavigate();
  const [kanbanData, setKanbanData] = useState<IKanban>({
    tableName: "",
    users: [],
    tasks: [],
    columns: [],
    statuses: [],
    backgroundImage: null,
    rows: [],
    kanbanSettings: [],
  });
  const [users, setUsers] = useState<IUser[]>([]);
  const [statusInput, setStatusInput] = useState<IStatus>({
    name: "",
    color: "#3394dc",
  });
  const [columnInput, setColumnInput] = useState<IColumnEntity>({
    name: "",
    order: 0,
    maxTasks: 0,
    tasks: [],
  });
  const [rowInput, setRowInput] = useState<IRow>({
    name: "",
    order: 0,
    maxTasks: 0,
    tasks: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKanbanData((prevState) => ({
      ...prevState,
      [name]: value ?? "",
    }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ApiResponse<IUser[]>>("users/all");
        setUsers(response.data.data ?? []);
      } catch (error: any) {
        toast.error(error.response?.data.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const onSelect = (selectedList: IUser[], _selectedItem: IUser) => {
    setKanbanData({ ...kanbanData, users: selectedList });
  };

  const onRemove = (selectedList: IUser[], _removedItem: IUser) => {
    setKanbanData({ ...kanbanData, users: selectedList });
  };

  const handleAddStatus = () => {
    if (statusInput.name.trim()) {
      setKanbanData((prevState) => ({
        ...prevState,
        statuses: [...prevState.statuses, statusInput],
      }));
      setStatusInput({ name: "", color: "#3394dc" });
    }
  };

  const handleRemoveStatus = (index: number) => {
    setKanbanData((prevState) => ({
      ...prevState,
      statuses: prevState.statuses.filter((_, i) => i !== index),
    }));
  };

  const handleAddColumn = () => {
    if (columnInput.name.trim()) {
      setKanbanData((prevState) => ({
        ...prevState,
        columns: [...prevState.columns, columnInput],
      }));
      setColumnInput({ name: "", order: 0, maxTasks: 0, tasks: [] });
    }
  };

  const handleAddRow = () => {
    if (rowInput.name.trim()) {
      setKanbanData((prevState) => ({
        ...prevState,
        rows: [...prevState.rows, rowInput],
      }));
      setRowInput({ name: "", order: 0, maxTasks: 0, tasks: [] });
    }
  };

  const handleRemoveColumn = (index: number) => {
    setKanbanData((prevState) => ({
      ...prevState,
      columns: prevState.columns.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKanbanData((prevState) => ({
          ...prevState,
          backgroundImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    api
      .post<ApiResponse<IKanban>>("kanban", kanbanData)
      .then((res) => {
        if (res.status === 201) {
          toast.success(t("board-created-successfully"));
          navigate(`/boards/${res.data.data?.id}`);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((_err) => {
        toast.error(t("failed-creating-board"));
        console.log(_err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.mainContainer}>
      <h1>{t("create-new-board")}</h1>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("board-name")}
          name="tableName"
          required
          onChange={handleInputChange}
          value={kanbanData.tableName}
        />

        <p>
          <i className="bi bi-people-fill"></i>
          {t("invite-users-to-board")}
        </p>
        <div className={styles.multiselect}>
          <Multiselect
            options={users}
            displayValue="email"
            onSelect={onSelect}
            onRemove={onRemove}
            placeholder={t("choose-users")}
            emptyRecordMsg={t("no-users")}
            loading={isLoading}
          />
        </div>

        <p>
          <i className="bi bi-tag-fill"></i>
          {t("create-status-list")}
        </p>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder={t("status-name")}
            value={statusInput.name}
            onChange={(e) =>
              setStatusInput({ ...statusInput, name: e.target.value })
            }
          />
          <input
            type="color"
            value={statusInput.color}
            onChange={(e) =>
              setStatusInput({ ...statusInput, color: e.target.value })
            }
          />
          <button type="button" onClick={handleAddStatus}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

        <div className={styles.listContainer}>
          <ul>
            {kanbanData.statuses.map((status, index) => (
              <li key={index}>
                <div>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: status.color }}
                  ></span>
                  {status.name}
                </div>
                <button type="button" onClick={() => handleRemoveStatus(index)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p>
          <i className="bi bi-columns-gap"></i>
          {t("add-additional-columns")}
        </p>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder={t("column-name")}
            value={columnInput.name}
            onChange={(e) =>
              setColumnInput({ ...columnInput, name: e.target.value })
            }
          />
          <input
            type="number"
            placeholder={t("order")}
            value={columnInput.order || ""}
            onChange={(e) =>
              setColumnInput({
                ...columnInput,
                order: parseInt(e.target.value) || 0,
              })
            }
          />
          <input
            type="number"
            placeholder={t("max-tasks")}
            value={columnInput.maxTasks || ""}
            onChange={(e) =>
              setColumnInput({
                ...columnInput,
                maxTasks: parseInt(e.target.value) || 0,
              })
            }
          />
          <button type="button" onClick={handleAddColumn}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

        <div className={styles.listContainer}>
          <ul>
            {kanbanData.columns.map((column, index) => (
              <li key={index}>
                <div>
                  <i className="bi bi-layout-three-columns mx-2"></i>
                  {column.name}{" "}
                  <span className="">
                    {t("order")} :{column.order}, {t("max-tasks")} {column.maxTasks})
                  </span>
                </div>
                <button type="button" onClick={() => handleRemoveColumn(index)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p>
          <i className="bi bi-columns-gap"></i>
          {t("add-additional-rows")}
        </p>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder={t("row-name")}
            value={rowInput.name}
            onChange={(e) => setRowInput({ ...rowInput, name: e.target.value })}
          />
          <input
            type="number"
            placeholder={t("order")}
            value={rowInput.order || ""}
            onChange={(e) =>
              setRowInput({
                ...rowInput,
                order: parseInt(e.target.value) || 0,
              })
            }
          />
          <input
            type="number"
            placeholder={t("max-tasks")}
            value={rowInput.maxTasks || ""}
            onChange={(e) =>
              setRowInput({
                ...rowInput,
                maxTasks: parseInt(e.target.value) || 0,
              })
            }
          />
          <button type="button" onClick={handleAddRow}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

        <div className={styles.listContainer}>
          <ul>
            {kanbanData.rows.map((row, index) => (
              <li key={index}>
                <div>
                  <i className="bi bi-layout-three-columns mx-2"></i>
                  {row.name}{" "}
                  <span className="">
                    {t("order")} {row.order}, {t("max-tasks")} {row.maxTasks})
                  </span>
                </div>
                <button type="button" onClick={() => handleRemoveColumn(index)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p>{t("background-photo")}</p>
        <div className={styles.inputGroup}>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="bi bi-hourglass-split"></i>
              {t("creating")}
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle"></i>
              {t("add-board")}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BoardsNew;
