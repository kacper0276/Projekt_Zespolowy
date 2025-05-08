import React, { useState, useEffect } from "react";
import { ITask } from "../../interfaces/ITask";
import { IUser } from "../../interfaces/IUser";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { toast } from "react-toastify";
import { IStatus } from "../../interfaces/IStatus";
import Multiselect from "multiselect-react-dropdown";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./TaskModal.module.scss";
import ToDoList from "../ToDoList/ToDoList";
import { useParams } from "react-router-dom";
import formatDateForInput from "../../helpers/FormatDate";
import { useTranslation } from "react-i18next";

interface TaskModalProps {
  taskId: string;
  taskText: string;
  columnId: string;
  onClose: () => void;
  isOpen: boolean;
  users?: IUser[];
  onTaskUpdate?: (updatedTask: {
    name: string;
    users: IUser[];
    status?: IStatus;
    deadline?: Date;
  }) => void;
  statuses?: IStatus[];
}

const TaskModal: React.FC<TaskModalProps> = ({
  taskId,
  taskText,
  columnId,
  onClose,
  isOpen,
  users = [],
  onTaskUpdate,
  statuses = [],
}) => {
  const { t } = useTranslation();
  const params = useParams();
  const [taskData, setTaskData] = useState<ITask>({
    name: taskText,
    description: "",
    status: { color: "", name: "" },
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
  const [showNewStatusForm, setShowNewStatusForm] = useState<boolean>(false);
  const [showStatusList, setShowStatusList] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<IStatus>({
    name: "",
    color: "#3394dc",
  });
  const [allStatuses, setAllStatuses] = useState<IStatus[]>(statuses);

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
      const updatedTaskData = {
        ...taskData,
        name: taskText,
        users: users || [],
      };
      fetchTaskData();
      setTaskData(updatedTaskData);
      setAllStatuses(statuses);
    }
  }, [isOpen, taskText, users, statuses]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<IUser[]>>("/users/all");
      setAllUsers(response.data.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data.message || t("failed-fetching-users")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskData = async () => {
    try {
      const response = await api.get<ApiResponse<ITask>>(`tasks/${taskId}`);
      const task = response.data.data;
      if (task) {
        setTaskData({ ...taskData, deadline: new Date(task.deadline) });
      } else {
      }
    } catch (error: any) {
      toast.error(
        error.response?.data.message || t("failed-fetching-data")
      );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "status") {
      const selectedStatus = allStatuses.find(
        (status) => status.name === value
      );
      setTaskData((prevState) => ({
        ...prevState,
        status: selectedStatus || { color: "", name: "" },
      }));
      return;
    }

    if (name === "deadline") {
      const date = new Date(value);
      setTaskData((prevState) => ({
        ...prevState,
        deadline: date,
      }));

      return;
    }

    setTaskData((prevState) => ({
      ...prevState,
      [name]: value ?? "",
    }));
  };

  // Handle new status form input changes
  const handleNewStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStatus((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Add new status
  const handleAddStatus = async () => {
    if (!newStatus.name.trim()) {
      toast.error(t("status-name-can-not-be-empty"));
      return;
    }

    // Check if status with the same name already exists
    if (allStatuses.some((status) => status.name === newStatus.name)) {
      toast.error(t("status-with-this-name-already-exists"));
      return;
    }

    const data = {
      name: newStatus.name,
      color: newStatus.color,
      kanbanId: params.id,
    };

    const res = await api.post<ApiResponse<IStatus>>(`status/create`, data);

    const updatedStatuses = [...allStatuses, res.data.data ?? newStatus];

    console.log(updatedStatuses);
    setAllStatuses(updatedStatuses);

    // Automatically select the new status
    setTaskData((prevState) => ({
      ...prevState,
      status: res.data.data ?? newStatus,
    }));

    // Reset form
    setNewStatus({ name: "", color: "#3394dc" });
    setShowNewStatusForm(false);

    toast.success(t("added-new-status"));
  };

  // Handle delete status with window.confirm
  const handleDeleteStatus = (statusName: string) => {
    const confirmDelete = window.confirm(
        t('confirm-delete-status', { status: statusName })
    );

    if (confirmDelete) {
      console.log(t('deleting-status', { status: statusName }));

      // Remove the status from the list
      const updatedStatuses = allStatuses.filter(
        (status) => status.name !== statusName
      );

      setAllStatuses(updatedStatuses);

      // If the current task has this status, clear the status
      if (taskData.status.name === statusName) {
        setTaskData((prevState) => ({
          ...prevState,
          status: { color: "", name: "" },
        }));
      }

      toast.success(t('status-deleted', { status: statusName }));
    }
  };

  //Clear selected status without deleting it from the list
  const handleClearSelectedStatus = () => {
    setTaskData((prevState) => ({
      ...prevState,
      status: { color: "", name: "" },
    }));
    toast.info(t("task-status-has-been-cleared"));
  };

  // Toggle status list visibility
  const toggleStatusList = () => {
    setShowStatusList(!showStatusList);
    if (showNewStatusForm && !showStatusList) {
      setShowNewStatusForm(false);
    }
  };

  const onSelect = (selectedList: IUser[], _selectedItem: IUser) => {
    setTaskData({ ...taskData, users: selectedList });
  };

  const onRemove = (selectedList: IUser[], _removedItem: IUser) => {
    setTaskData({ ...taskData, users: selectedList });
  };

  // Function to handle manual removal of a user chip
  const handleRemoveUser = (userId: string | number) => {
    const updatedUsers = taskData.users.filter((user) => user.id !== userId);
    setTaskData({ ...taskData, users: updatedUsers });
  };

  const handleSaveTask = async () => {
    setIsLoading(true);
    try {
      //TODO tu api potem

      if (onTaskUpdate) {
        onTaskUpdate({
          name: taskData.name,
          users: taskData.users,
          status: taskData.status,
          deadline: taskData.deadline,
        });
      }

      toast.success(t("task-has-been-updated"));
      onClose();
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data.message ||
          t("error-during-task-update")
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
          <h3>{t("task-details")}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.taskInfo}>

            <div className={styles.formGroup}>
              <label htmlFor="taskName">{t("task-name")}</label>
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
              <label htmlFor="deadline">{t("choose-deadline")}</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formatDateForInput(taskData.deadline)}
                onChange={handleInputChange}
                className={styles.formControl}
              />
            </div>

            {/* Status section with status creation and management options */}
            <div className={styles.formGroup}>
              <div className={styles.statusHeader}>
                <label htmlFor="status">{t("task-status")}</label>
                <div className={styles.statusActions}>
                  <button
                    className={styles.manageStatusButton}
                    onClick={toggleStatusList}
                  >
                    {showStatusList ? (
                      <>
                        <i className="bi bi-x-circle"></i> {t("hide-statuses")}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash"></i> {t("delete-status")}
                      </>
                    )}
                  </button>
                  <button
                    className={styles.addStatusButton}
                    onClick={() => {
                      setShowNewStatusForm(!showNewStatusForm);
                      if (showStatusList && !showNewStatusForm) {
                        setShowStatusList(false);
                      }
                    }}
                  >
                    {showNewStatusForm ? (
                      <>
                        <i className="bi bi-x-circle"></i> {t("cancel")}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle"></i>{t("new-status")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status list for deletion */}
              {showStatusList && (
                <div className={styles.statusListContainer}>
                  <h4 className={styles.statusListTitle}>
                    {t("manage-statuses")}
                  </h4>
                  <div className={styles.statusList}>
                    {allStatuses.length > 0 ? (
                      allStatuses.map((status, index) => (
                        <div key={index} className={styles.statusListItem}>
                          <span
                            className={styles.statusColorIndicator}
                            style={{ backgroundColor: status.color }}
                          ></span>
                          <span className={styles.statusName}>
                            {status.name}
                          </span>
                          <button
                            className={styles.closeButtonAnimated}
                            onClick={() => handleDeleteStatus(status.name)}
                            title={t("delete-status")}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noStatusMessage}>
                        {t("no-defined-statuses")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Show the new status form if user clicked the button */}
              {showNewStatusForm && (
                <div className={styles.newStatusForm}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="statusName">{t("name")}</label>
                      <input
                        type="text"
                        id="statusName"
                        name="name"
                        value={newStatus.name}
                        onChange={handleNewStatusChange}
                        className={styles.formControl}
                        placeholder={t("status-name")}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="statusColor">{t("color")}</label>
                      <div className={styles.colorPickerWrapper}>
                        <input
                          type="color"
                          id="statusColor"
                          name="color"
                          value={newStatus.color}
                          onChange={handleNewStatusChange}
                          className={styles.colorPicker}
                        />
                        <span
                          className={styles.colorPreview}
                          style={{ backgroundColor: newStatus.color }}
                        ></span>
                      </div>
                    </div>
                  </div>
                  <button
                    className={styles.addButton}
                    onClick={handleAddStatus}
                  >
                    {t("add-status")}
                  </button>
                </div>
              )}

              {/* Status dropdown */}
              <select
                id="status"
                name="status"
                value={taskData.status.color}
                onChange={handleInputChange}
                className={styles.formControl}
              >
                <option value="">{t("choose-status")}</option>
                {allStatuses.map((status, index) => (
                  <option key={index} value={status.name}>
                    {status.name}
                  </option>
                ))}
              </select>

              {/* Status preview with clear button (not delete) */}
              {taskData.status.name !== "" && taskData.status.color !== "" && (
                <div className={styles.statusPreview}>
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor:
                        allStatuses.find((s) => s.name === taskData.status.name)
                          ?.color || "#3394dc",
                    }}
                  ></span>
                  {taskData.status.name}
                  <button
                    className={styles.closeButtonAnimated}
                    onClick={handleClearSelectedStatus}
                    title={t("clear-chosen-status")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t("assigned-users")}</label>
              <div className={styles.multiselectContainer}>
                {/* Custom selected users wrapper */}
                <div className={styles.selectedUsersWrapper}>
                  {taskData.users.map((user) => (
                    <div key={user.id} className={styles.userChip}>
                      {user.email}
                      <span
                        className={styles.closeButtonAnimated}
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <i className="bi bi-x"></i>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Multiselect component with hidden chips */}
                <Multiselect
                  options={allUsers}
                  selectedValues={taskData.users}
                  displayValue="email"
                  onSelect={onSelect}
                  onRemove={onRemove}
                  placeholder={t("choose-users")}
                  emptyRecordMsg={t("no-users")}
                  loading={isLoading}
                  hidePlaceholder={taskData.users.length > 0}
                  hideSelectedList={true}
                  style={{
                    searchBox: {
                      background: "#1E1E1E",
                      border: "1px solid #444",
                      borderRadius: "0 0 4px 4px",
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
              <label>{t("task-lists")}</label>
              <ToDoList taskId={+taskId} />
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.saveButton}
                onClick={handleSaveTask}
                disabled={isLoading}
              >
                {isLoading ? t("saving") : t("save-changes")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
