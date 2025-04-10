import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import styles from "./TaskItem.module.scss";
import TaskModal from "../TaskModal/TaskModal";
import { IUser } from "../../interfaces/IUser";
import { useApiJson } from "../../config/api";
import { IStatus } from "../../interfaces/IStatus";

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
  const api = useApiJson();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskText, setTaskText] = useState(task.name || task.content || "");
  const [taskUsers, setTaskUsers] = useState<IUser[]>(task.users || []);
  const [taskStatus, setTaskStatus] = useState<IStatus | undefined>(
    task.status
  );
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);

  // Ensure uniqueness by combining columnId and task id
  const uniqueDraggableId = `${columnId}-${task.id}-${index}`;

  const handleTaskClick = (e: React.MouseEvent) => {
    // Prevent opening modal when clicking delete button or user avatar
    if (
      (e.target as HTMLElement).closest(`.${styles.deleteTaskButton}`) ||
      (e.target as HTMLElement).closest(`.${styles.userAvatars}`)
    ) {
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleTaskUpdate = (updatedTask: {
    name: string;
    users: IUser[];
    status?: IStatus;
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
    e.dataTransfer.dropEffect = 'copy';
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
      const userData = e.dataTransfer.getData('application/json');
      if (userData) {
        const user: IUser = JSON.parse(userData);
        
        // Check if user is already assigned to this task
        if (!taskUsers.some(existingUser => existingUser.id === user.id)) {
          const updatedUsers = [...taskUsers, user];
          setTaskUsers(updatedUsers);
          
          // Call API to update task users
          api.patch(`tasks/${task.id}/assign-users`, { users: updatedUsers });
          
          // Update parent component
          onTaskUpdate({
            name: taskText,
            users: updatedUsers,
            status: taskStatus
          });
        }
      }
    } catch (error) {
      console.error("Error processing dropped user:", error);
    }
  };


  return (
    <>
      <Draggable draggableId={uniqueDraggableId} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.item} ${isDropTargetActive ? styles.dropActive : ''}`}
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
                          // Removed the onClick handler that was causing users to be removed
                        >
                          {getUserInitials(user.firstName || "", user.lastName || "")}
                        </div>
                      ))}
                      {taskUsers.length > 3 && (
                        <div
                          className={styles.userAvatar}
                          title={`${taskUsers.length - 3} more users`}
                        >
                          +{taskUsers.length - 3}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.noUsers}>No users</div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask();
                  }}
                  className={styles.deleteTaskButton}
                  title="Usuń zadanie"
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
            </div>
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