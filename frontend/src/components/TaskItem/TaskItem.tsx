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
    status?: string;
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
  
  // Ensure uniqueness by combining columnId and task id
  const uniqueDraggableId = `${columnId}-${task.id}-${index}`;


  const handleTaskClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.deleteTaskButton}`)) {
      return;
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleTaskUpdate = (updatedTask: { name: string; users: IUser[] }) => {
    const taskId = task.id;
    api
      .patch(`tasks/${taskId}/assign-users`, { users: updatedTask.users })
      .then((res) => {
        console.log(res);
      });
    setTaskText(updatedTask.name);
    setTaskUsers(updatedTask.users || []);
    
    // Call the parent's onTaskUpdate with the updated task data
    onTaskUpdate({
      name: updatedTask.name,
      users: updatedTask.users
    });
  };
  
  const getUserInitials = (email: string): string => {
    if (!email) return "??";
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <>
      <Draggable draggableId={uniqueDraggableId} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={styles.item}
            onClick={handleTaskClick}
          >
            <div className={styles.taskContent}>
              <span className={styles.taskText}>{taskText}</span>
              <div className={styles.taskActions}>
                <div className={styles.userAvatars}>
                  {taskUsers && taskUsers.length > 0 ? (
                    <>
                      {taskUsers.slice(0, 3).map((user, index) => (
                        <div
                          key={index}
                          className={styles.userAvatar}
                          title={user.email || "Unknown user"}
                        >
                          {getUserInitials(user.email)}
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