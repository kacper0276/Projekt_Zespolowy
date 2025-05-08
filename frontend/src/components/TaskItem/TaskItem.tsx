import React, { useState, useEffect } from "react";
import { Draggable } from "@hello-pangea/dnd";
import styles from "./TaskItem.module.scss";
import TaskModal from "../TaskModal/TaskModal";
import { IUser } from "../../interfaces/IUser";
import { useApiJson } from "../../config/api";
import { IStatus } from "../../interfaces/IStatus";
import { IToDoList } from "../../interfaces/IToDoList";
import { ApiResponse } from "../../types/api.types";
import { useTranslation } from "react-i18next";

interface ItemProps {
  task: {
    id: string;
    content: string;
    name?: string;
    description?: string;
    users?: IUser[];
    status?: IStatus;
    priority?: string;
    deadline?: Date;
    statusId?: number;
    lastColumnName?: string;
    lastMovedToColumnAt?: Date;
  };
  index: number;
  columnId: string;
  onDeleteTask: () => void;
  onTaskUpdate: (updatedData: any) => void;
  statuses?: IStatus[];
}

const TaskItem: React.FC<ItemProps> = ({
  task,
  index,
  columnId,
  onDeleteTask,
  onTaskUpdate,
  statuses,
}) => {
  const { t } = useTranslation();
  const api = useApiJson();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskText, setTaskText] = useState(task.name || task.content || "");
  const [taskUsers, setTaskUsers] = useState<IUser[]>(task.users || []);
  const [taskStatus, setTaskStatus] = useState<IStatus | undefined>(
    task.status
  );
  const [taskDeadline, setTaskDeadline] = useState<Date | null>(
    task.deadline || null
  );
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);

  // TODO Lists state
  const [todoLists, setTodoLists] = useState<IToDoList[]>([]);
  const [isToDoListExpanded, setIsToDoListExpanded] = useState(false);
  const [_todoListsLoading, setTodoListsLoading] = useState(false);

  // Ensure uniqueness by combining columnId and task id
  const uniqueDraggableId = `${columnId}-${task.id}-${index}`;

  // Fetch TODO lists when component mounts
  useEffect(() => {
    fetchTodoLists();
  }, [task.id]);

  const fetchTodoLists = async () => {
    setTodoListsLoading(true);
    try {
      const response = await api.get<ApiResponse<IToDoList[]>>(
        `to-do-lists/task/${task.id}`
      );
      setTodoLists(response.data.data || []);
    } catch (error) {
      console.error("Error fetching TODO lists:", error);
    } finally {
      setTodoListsLoading(false);
    }
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    // Prevent opening modal when clicking delete button, user avatar, or todo list toggle
    if (
      (e.target as HTMLElement).closest(`.${styles.deleteTaskButton}`) ||
      (e.target as HTMLElement).closest(`.${styles.userAvatars}`) ||
      (e.target as HTMLElement).closest(`.${styles.todoListToggle}`) ||
      (e.target as HTMLElement).closest(`.${styles.todoItem}`)
    ) {
      return;
    }
    setIsModalOpen(true);
  };

  const toggleTodoList = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToDoListExpanded(!isToDoListExpanded);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Refresh todo lists when modal is closed
    fetchTodoLists();
  };

  const handleTaskUpdate = (updatedTask: {
    name: string;
    users: IUser[];
    status?: IStatus;
    deadline?: Date;
  }) => {
    const taskId = task.id;
    api.patch(`tasks/${taskId}/assign-users`, { users: updatedTask.users });
    setTaskText(updatedTask.name);
    setTaskUsers(updatedTask.users || []);
    // Update task status if provided
    if (updatedTask.status) {
      api.patch(`tasks/${taskId}/change-status`, {
        status: updatedTask.status,
      });
      setTaskStatus(updatedTask.status);
    }

    if (updatedTask.deadline) {
      api.patch(`tasks/${taskId}/change-deadline`, {
        deadline: updatedTask.deadline,
      });
      setTaskDeadline(updatedTask.deadline);
    }

    // Call the parent's onTaskUpdate with the updated task data
    onTaskUpdate({
      name: updatedTask.name,
      users: updatedTask.users,
      status: updatedTask.status,
    });
  };

  const getUserInitials = (firstName: string, lastName: string): string => {
    if (!firstName || !lastName) return "??";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Find status color based on status name
  const getStatusColor = (): string => {
    if (!taskStatus || !statuses) return "transparent";
    return taskStatus.color || "transparent";
  };

  // Handle drag over for user drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDropTargetActive(true);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setIsDropTargetActive(false);
  };

  // Handle drop of user onto task
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTargetActive(false);
    try {
      const userData = e.dataTransfer.getData("application/json");
      if (userData) {
        const user: IUser = JSON.parse(userData);
        if (!taskUsers.some((existingUser) => existingUser.id === user.id)) {
          const updatedUsers = [...taskUsers, user];
          setTaskUsers(updatedUsers);
          api.patch(`tasks/${task.id}/assign-users`, { users: updatedUsers });
          onTaskUpdate({
            name: taskText,
            users: updatedUsers,
            status: taskStatus,
          });
        }
      }
    } catch (error) {
      console.error("Error processing dropped user:", error);
    }
  };

  // Modified function to toggle todo item status locally without API call
  const toggleTodoItemStatus = (
    listId: number,
    itemId: number,
    isDone: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const updatedLists = todoLists.map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, isDone: !isDone } : item
          ),
        };
      }
      return list;
    });

    setTodoLists(updatedLists);

    console.log("Todo item toggled locally:", {
      listId,
      itemId,
      newStatus: !isDone,
    });
  };

  return (
    <>
      <Draggable draggableId={uniqueDraggableId} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.item} ${
              isDropTargetActive ? styles.dropActive : ""
            }`}
            onClick={handleTaskClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Add status badge if status exists */}
            {taskStatus && (
              <div
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor() }}
              >
                {taskStatus.name}
              </div>
            )}
            {taskDeadline && (
              <div className={styles.deadlineBadge}>
                <i
                  className="bi bi-calendar"
                  style={{ marginRight: "20px" }}
                ></i>
                {new Date(taskDeadline).toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </div>
            )}
            {task.lastColumnName && task.lastMovedToColumnAt && (
              <div className={styles.lastMovedBadge}>
                <i className="bi bi-clock" style={{ marginRight: "20px" }}></i>
                <span className={styles.lastMovedDate}>
                  {new Date(task.lastMovedToColumnAt)
                    .toLocaleString("pl-PL", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .replace(",", "")}
                </span>
              </div>
            )}
            <div className={styles.taskContent}>
              <span className={styles.taskText}>{taskText}</span>
              <div className={styles.taskActions}>
                <div
                  className={styles.userAvatars}
                  onClick={(e) => e.stopPropagation()}
                >
                  {taskUsers && taskUsers.length > 0 ? (
                    <>
                      {taskUsers.slice(0, 3).map((user, index) => (
                        <div
                          key={index}
                          className={styles.userAvatar}
                          title={`${user.firstName} ${user.lastName}`}
                        >
                          {getUserInitials(
                            user.firstName || "",
                            user.lastName || ""
                          )}
                        </div>
                      ))}
                      {taskUsers.length > 3 && (
                        <div
                          className={styles.userAvatar}
                          title={t("more-users", { count: taskUsers.length - 3 })}
                        >
                          +{taskUsers.length - 3}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.noUsers}>{t("no-users")}</div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask();
                  }}
                  className={styles.deleteTaskButton}
                  title={t("remove-task")}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
            </div>
            {/* Todo Lists Section - only show if there are lists */}
            {todoLists.length > 0 && (
              <div className={styles.todoListSection}>
                <div className={styles.todoListToggle} onClick={toggleTodoList}>
                  <i
                    className={`bi ${
                      isToDoListExpanded ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                  <span>
                    {t("tasks-list")} (
                    {todoLists.reduce(
                      (total, list) => total + list.items.length,
                      0
                    )}
                    )
                  </span>
                </div>

                <div
                  className={`${styles.todoListContent} ${
                    isToDoListExpanded ? styles.expanded : ""
                  }`}
                >
                  {todoLists.map((list) => (
                    <div
                      key={list.id}
                      className={styles.todoList}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles.todoListHeader}>
                        <h4>{list.name}</h4>
                      </div>
                      <ul className={styles.todoItems}>
                        {list.items.length > 0 ? (
                          list.items.map((item) => (
                            <li
                              key={item.id}
                              className={`${styles.todoItem} ${
                                item.isDone ? styles.completed : ""
                              }`}
                              onClick={(e) =>
                                toggleTodoItemStatus(
                                  list.id || 0,
                                  item.id || 0,
                                  item.isDone || false,
                                  e
                                )
                              }
                            >
                              <div
                                className={styles.todoCheckbox}
                                onClick={(e) =>
                                  toggleTodoItemStatus(
                                    list.id || 0,
                                    item.id || 0,
                                    item.isDone || false,
                                    e
                                  )
                                }
                              >
                                <i
                                  className={`bi ${
                                    item.isDone
                                      ? "bi-check-square"
                                      : "bi-square"
                                  }`}
                                ></i>
                              </div>
                              <span className={styles.todoItemText}>
                                {item.name}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className={styles.emptyListMessage}>
                            {t("no-tasks-on-the-list")}
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>
      <TaskModal
        taskId={task.id}
        taskText={taskText}
        columnId={columnId}
        isOpen={isModalOpen}
        onClose={closeModal}
        users={taskUsers}
        onTaskUpdate={handleTaskUpdate}
        statuses={statuses}
      />
    </>
  );
};

export default TaskItem;
