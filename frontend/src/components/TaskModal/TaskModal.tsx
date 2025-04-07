import React, { useState, useEffect } from "react";
import { ITask } from "../../interfaces/ITask";
import { IUser } from "../../interfaces/IUser";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { toast } from "react-toastify";
import Multiselect from "multiselect-react-dropdown";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./TaskModal.module.scss";
import ToDoList from "../ToDoList/ToDoList";

interface TaskModalProps {
  taskId: string;
  taskText: string;
  columnId: string;
  onClose: () => void;
  isOpen: boolean;
  users?: IUser[];
  onTaskUpdate?: (updatedTask: { name: string; users: IUser[] }) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  taskId,
  taskText,
  columnId,
  onClose,
  isOpen,
  users = [],
  onTaskUpdate,
}) => {
  const [taskData, setTaskData] = useState<ITask>({
    name: taskText,
    description: "",
    status: "",
    priority: "",
    order: 0,
    deadline: new Date(),
    users: users || [],
    column: {
      name: "",
      status: "",
      tasks: [],
      order: 0,
      maxTasks: 0,
      kanban: undefined,
    },
    kanbans: [],
    toDoLists: [],
    row: { name: "", order: 0, tasks: [], maxTasks: 0 },
  });

  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const api = useApiJson();

  // Fetch all users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Reset task data when props change
  useEffect(() => {
    if (isOpen) {
      setTaskData((prev) => ({
        ...prev,
        name: taskText,
        users: users || [],
      }));
    }
  }, [isOpen, taskText, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<IUser[]>>("/users/all");
      setAllUsers(response.data.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data.message || "Nie udało się pobrać użytkowników"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaskData((prevState) => ({
      ...prevState,
      [name]: value ?? "",
    }));
  };

  const onSelect = (selectedList: IUser[], _selectedItem: IUser) => {
    setTaskData({ ...taskData, users: selectedList });
  };

  const onRemove = (selectedList: IUser[], _removedItem: IUser) => {
    setTaskData({ ...taskData, users: selectedList });
  };

  const handleSaveTask = async () => {
    setIsLoading(true);
    try {
      //tu api potem
      if (onTaskUpdate) {
        onTaskUpdate({
          name: taskData.name,
          users: taskData.users,
        });
      }

      toast.success("Zadanie zostało zaktualizowane");
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data.message ||
          "Wystąpił błąd podczas aktualizacji zadania"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null; 
  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Szczegóły zadania</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.taskInfo}>
            <p>
              <strong>ID zadania:</strong> {taskId}
            </p>
            <p>
              <strong>Kolumna:</strong> {columnId}
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="taskName">Treść zadania:</label>
              <input
                type="text"
                id="taskName"
                name="name"
                value={taskData.name}
                onChange={handleInputChange}
                className={styles.formControl}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Przypisani użytkownicy:</label>
              <div className={styles.multiselectContainer}>
                <Multiselect
                  options={allUsers}
                  selectedValues={taskData.users}
                  displayValue="email"
                  onSelect={onSelect}
                  onRemove={onRemove}
                  placeholder="Wybierz użytkowników"
                  emptyRecordMsg="Brak użytkowników"
                  loading={isLoading}
                  style={{
                    chips: {
                      background: "#02a676",
                    },
                    searchBox: {
                      background: "#1E1E1E",
                      border: "1px solid #444",
                      borderRadius: "4px",
                      color: "#E0E0E0",
                    },
                    optionContainer: {
                      background: "#1E1E1E",
                      border: "1px solid #444",
                      borderRadius: "4px",
                    },
                    option: {
                      color: "#E0E0E0",
                    },
                  }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Listy zadań:</label>
              <ToDoList taskId={+taskId} />
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.saveButton}
                onClick={handleSaveTask}
                disabled={isLoading}
              >
                {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
