import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import styles from './TaskItem.module.scss'

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
  const uniqueDraggableId = `${columnId}-${uniqueId}`
 
  return (
    <Draggable draggableId={uniqueDraggableId} index={index}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={styles.item}
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
  )
}

export default Item