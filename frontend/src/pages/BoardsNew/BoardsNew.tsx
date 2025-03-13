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

const BoardsNew: React.FC = () => {
  useWebsiteTitle("Create new Board");
  const api = useApiJson();
  const [kanbanData, setKanbanData] = useState<IKanban>({
    tableName: "",
    users: [],
    tasks: [],
    columns: [],
    statuses: [],
  });
  const [users, setUsers] = useState<IUser[]>([]);
  const [statusInput, setStatusInput] = useState<IStatus>({
    name: "",
    color: "",
  });
  const [columnInput, setColumnInput] = useState<IColumnEntity>({
    name: "",
    order: 0,
    maxTasks: 0,
    tasks: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKanbanData((prevState) => ({
      ...prevState,
      [name]: value ?? "",
    }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<ApiResponse<IUser[]>>("users/all");
        setUsers(response.data.data ?? []);
      } catch (error: any) {
        toast.error(error.response?.data.message || error.message);
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
      setStatusInput({ name: "", color: "" });
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

  const handleRemoveColumn = (index: number) => {
    setKanbanData((prevState) => ({
      ...prevState,
      columns: prevState.columns.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className={styles.mainContainer}>
      <h1>Utwórz nową tablicę</h1>
      <form className={styles.formContainer}>
        <input
          type="text"
          placeholder="Nazwa tabeli"
          name="tableName"
          required
          onChange={handleInputChange}
        />

        <p>Wyślij zaproszenie użytkownikom do tablicy</p>
        <Multiselect
          className={styles.multiselect}
          options={users}
          displayValue="email"
          onSelect={onSelect}
          onRemove={onRemove}
          placeholder="Wybierz użytkowników"
          emptyRecordMsg="Brak użytkowników"
        />

        <p>Utwórz listę statusów</p>
        <div>
          <input
            type="text"
            placeholder="Nazwa statusu"
            value={statusInput.name}
            onChange={(e) =>
              setStatusInput({ ...statusInput, name: e.target.value })
            }
          />
          <input
            type="color"
            placeholder="Kolor statusu"
            value={statusInput.color}
            onChange={(e) =>
              setStatusInput({ ...statusInput, color: e.target.value })
            }
          />
          <button type="button" onClick={handleAddStatus}>
            +
          </button>
          <ul>
            {kanbanData.statuses.map((status, index) => (
              <li key={index}>
                {status.name} ({status.color}){" "}
                <button type="button" onClick={() => handleRemoveStatus(index)}>
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p>Dodaj własne kolumny</p>
        <div>
          <input
            type="text"
            placeholder="Nazwa kolumny"
            value={columnInput.name}
            onChange={(e) =>
              setColumnInput({ ...columnInput, name: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Kolejność kolumny"
            value={columnInput.order}
            onChange={(e) =>
              setColumnInput({
                ...columnInput,
                order: parseInt(e.target.value),
              })
            }
          />
          <input
            type="number"
            placeholder="Maksymalna liczba zadań"
            value={columnInput.maxTasks}
            onChange={(e) =>
              setColumnInput({
                ...columnInput,
                maxTasks: parseInt(e.target.value),
              })
            }
          />
          <button type="button" onClick={handleAddColumn}>
            +
          </button>
          <ul>
            {kanbanData.columns.map((column, index) => (
              <li key={index}>
                {column.name} (Order: {column.order}, Max Tasks:{" "}
                {column.maxTasks}){" "}
                <button type="button" onClick={() => handleRemoveColumn(index)}>
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button>Dodaj tablicę</button>
      </form>
    </div>
  );
};

export default BoardsNew;
