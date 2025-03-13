import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import styles from './TaskItem.module.scss';
import TaskModal from '../TaskModal/TaskModal';

interface ItemProps {
  text: string;
  index: number;
  columnId: string;
  uniqueId: string;
  onDeleteTask: () => void;
}

const Item: React.FC<ItemProps> = ({
  text,
  index,
  columnId,
  uniqueId,
  onDeleteTask
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const uniqueDraggableId = `${columnId}-${uniqueId}`;
  
  const handleTaskClick = (e: React.MouseEvent) => {
    // Don't open modal if delete button was clicked
    if ((e.target as HTMLElement).closest(`.${styles.deleteTaskButton}`)) {
      return;
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
 
  return (
    <>
      <Draggable draggableId={uniqueDraggableId} index={index}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={styles.item}
            onClick={handleTaskClick}
          >
            <div className={styles.taskContent}>
              <span className={styles.taskText}>{text}</span>
              <div className={styles.taskActions}>
                <button
                  onClick={onDeleteTask}
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
      
      {/* Task Modal */}
      <TaskModal
        taskId={uniqueId}
        taskText={text}
        columnId={columnId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default Item;