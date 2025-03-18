import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import styles from './TaskItem.module.scss';
import TaskModal from '../TaskModal/TaskModal';
import { IUser } from '../../interfaces/IUser';

interface ItemProps {
  text: string;
  index: number;
  columnId: string;
  uniqueId: string;
  onDeleteTask: () => void;
  users?: IUser[];
}

const Item: React.FC<ItemProps> = ({
  text,
  index,
  columnId,
  uniqueId,
  onDeleteTask,
  users = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskText, setTaskText] = useState(text);
  const [taskUsers, setTaskUsers] = useState<IUser[]>(users);

  // Ensure uniqueness by combining columnId, uniqueId and index
  const uniqueDraggableId = `${columnId}-${uniqueId}-${index}`;

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
    setTaskText(updatedTask.name);
    setTaskUsers(updatedTask.users || []);
  };

  const getUserInitials = (email: string): string => {
    if (!email) return '??';
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
                  {taskUsers.length > 0 ? (
                    <>
                      {taskUsers.slice(0, 3).map((user, index) => (
                        <div
                          key={index}
                          className={styles.userAvatar}
                          title={user.email || 'Unknown user'}
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
        taskId={uniqueId}
        taskText={taskText}
        columnId={columnId}
        isOpen={isModalOpen}
        onClose={closeModal}
        users={taskUsers}
        onTaskUpdate={handleTaskUpdate}
      />
    </>
  );
};

export default Item;