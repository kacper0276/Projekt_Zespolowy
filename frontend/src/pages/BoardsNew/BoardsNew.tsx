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
import 'bootstrap-icons/font/bootstrap-icons.css';

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
    color: "#3394dc",
  });
  const [columnInput, setColumnInput] = useState<IColumnEntity>({
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

  const handleRemoveColumn = (index: number) => {
    setKanbanData((prevState) => ({
      ...prevState,
      columns: prevState.columns.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Tablica została utworzona pomyślnie!");
      setIsLoading(false);
      // Reset form or redirect
      // You would typically make an API call here instead
    }, 1000);
  };

  return (
    <div className={styles.mainContainer}>
      <h1>Utwórz nową tablicę</h1>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nazwa tabeli"
          name="tableName"
          required
          onChange={handleInputChange}
          value={kanbanData.tableName}
        />

        <p>
          <i className="bi bi-people-fill"></i>
          Wyślij zaproszenie użytkownikom do tablicy
        </p>
        <div className={styles.multiselect}>
          <Multiselect
            options={users}
            displayValue="email"
            onSelect={onSelect}
            onRemove={onRemove}
            placeholder="Wybierz użytkowników"
            emptyRecordMsg="Brak użytkowników"
            loading={isLoading}
          />
        </div>

        <p>
          <i className="bi bi-tag-fill"></i>
          Utwórz listę statusów
        </p>
        <div className={styles.inputGroup}>
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
          Dodaj własne kolumny
        </p>
        <div className={styles.inputGroup}>
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
            placeholder="Kolejność"
            value={columnInput.order || ''}
            onChange={(e) =>
              setColumnInput({
                ...columnInput,
                order: parseInt(e.target.value) || 0,
              })
            }
          />
          <input
            type="number"
            placeholder="Max. zadań"
            value={columnInput.maxTasks || ''}
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
                  {column.name} <span className="">(Kolejność: {column.order}, Max zadań: {column.maxTasks})</span>
                </div>
                <button type="button" onClick={() => handleRemoveColumn(index)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? (
            <>
              <i className="bi bi-hourglass-split"></i>
              Tworzenie...
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle"></i>
              Dodaj tablicę
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BoardsNew;