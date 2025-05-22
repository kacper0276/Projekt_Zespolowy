import React, { useState, useEffect } from "react";
import { ITask } from "../../interfaces/ITask";
import { IUser } from "../../interfaces/IUser";
import { IComment } from "../../interfaces/IComment";
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
import { useUser } from "../../context/UserContext";
import PlaceholderPfP from "../../assets/PlaceholderPictures/PlaceholderPfP.png";

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
  const { user } = useUser();
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
    comments: [],
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
  
  // Comments state
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loadingComments, setLoadingComments] = useState<boolean>(false);

  const api = useApiJson();

  // Fetch all users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchComments();
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
        error.response?.data.message || "Failed to fetch users"
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
        error.response?.data.message || "Failed to fetch task data"
      );
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await api.get<ApiResponse<IComment[]>>(`/comments/task/${taskId}`);
      setComments(response.data.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data.message || "Failed to fetch comments"
      );
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (!user?.email) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const commentData = {
        content: newComment.trim(),
        userEmail: user.email,
        taskId: parseInt(taskId),
      };

      const response = await api.post<ApiResponse<IComment>>("/comments", commentData);
      
      if (response.data.data) {
        setComments(prevComments => [...prevComments, response.data.data!]);
        setNewComment("");
        toast.success("Comment added successfully");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data.message || "Failed to add comment"
      );
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      toast.success("Comment deleted successfully");
    } catch (error: any) {
      toast.error(
        error.response?.data.message || "Failed to delete comment"
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
      toast.error("Status name cannot be empty");
      return;
    }

    // Check if status with the same name already exists
    if (allStatuses.some((status) => status.name === newStatus.name)) {
      toast.error("Status with this name already exists");
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

    toast.success("New status added");
  };

  // Handle delete status with window.confirm
  const handleDeleteStatus = (statusName: string) => {
    const confirmDelete = window.confirm(
        `Are you sure you want to delete status "${statusName}"?`
    );

    if (confirmDelete) {
      console.log(`Deleting status: ${statusName}`);

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

      toast.success(`Status "${statusName}" deleted`);
    }
  };

  //Clear selected status without deleting it from the list
  const handleClearSelectedStatus = () => {
    setTaskData((prevState) => ({
      ...prevState,
      status: { color: "", name: "" },
    }));
    toast.info("Task status has been cleared");
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

      toast.success("Task has been updated");
      onClose();
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data.message ||
          "Error during task update"
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

  const canDeleteComment = (comment: IComment) => {
    return user?.email === comment.user.email;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Task Details</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.taskInfo}>

            <div className={styles.formGroup}>
              <label htmlFor="taskName">Task Name</label>
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
              <label htmlFor="deadline">Choose Deadline</label>
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
                <label htmlFor="status">Task Status</label>
                <div className={styles.statusActions}>
                  <button
                    className={styles.manageStatusButton}
                    onClick={toggleStatusList}
                  >
                    {showStatusList ? (
                      <>
                        <i className="bi bi-x-circle"></i> Hide Statuses
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash"></i> Delete Status
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
                        <i className="bi bi-x-circle"></i> Cancel
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle"></i> New Status
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status list for deletion */}
              {showStatusList && (
                <div className={styles.statusListContainer}>
                  <h4 className={styles.statusListTitle}>
                    Manage Statuses
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
                            title="Delete Status"
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noStatusMessage}>
                        No defined statuses
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
                      <label htmlFor="statusName">Name</label>
                      <input
                        type="text"
                        id="statusName"
                        name="name"
                        value={newStatus.name}
                        onChange={handleNewStatusChange}
                        className={styles.formControl}
                        placeholder="Status Name"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="statusColor">Color</label>
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
                    Add Status
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
                <option value="">Choose Status</option>
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
                    title="Clear Chosen Status"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Assigned Users</label>
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
                  placeholder="Choose Users"
                  emptyRecordMsg="No Users"
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
              <label>Task Lists</label>
              <ToDoList taskId={+taskId} />
            </div>

            {/* Comments Section */}
            <div className={styles.formGroup}>
              <div className={styles.commentsSection}>
                <div className={styles.commentsHeader}>
                  <h4>Comments</h4>
                  {comments.length > 0 && (
                    <span className={styles.commentsCount}>
                      {comments.length}
                    </span>
                  )}
                </div>
                
                {/* Add comment form */}
                <div className={styles.addCommentForm}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this task..."
                    className={styles.commentTextarea}
                  />
                  <button
                    onClick={handleAddComment}
                    className={styles.addCommentButton}
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </button>
                </div>

                {/* Comments list */}
                <div className={styles.commentsList}>
                  {loadingComments ? (
                    <div className={styles.commentsLoading}>
                      Loading comments...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className={styles.noComments}>
                      No comments yet. Be the first to share your thoughts!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className={styles.commentItem}>
                        <div className={styles.commentHeader}>
                          <div className={styles.commentUserInfo}>
                            <div className={styles.commentUserAvatar}>
                              <img
                                src={
                                  comment.user.profileImage
                                    ? comment.user.profileImage
                                    : PlaceholderPfP
                                }
                                alt={t("profile")}
                                onError={(e) => (e.currentTarget.src = PlaceholderPfP)}
                              />
                            </div>
                            <span className={styles.commentAuthor}>
                              {comment.user.firstName && comment.user.lastName 
                                ? `${comment.user.firstName} ${comment.user.lastName}`
                                : comment.user.email
                              }
                            </span>
                            {comment.user.login && (
                              <span className={styles.commentUsername}>
                                @{comment.user.login}
                              </span>
                            )}
                          </div>
                          <div className={styles.commentActions}>
                            {canDeleteComment(comment) && (
                              <button
                                onClick={() => comment.id && handleDeleteComment(comment.id)}
                                className={styles.commentDeleteButton}
                                title="Delete comment"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className={styles.commentContent}>
                          {comment.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.saveButton}
                onClick={handleSaveTask}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;