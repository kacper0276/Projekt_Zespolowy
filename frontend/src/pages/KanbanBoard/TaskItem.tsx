import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import styles from './TaskItem.module.scss'

interface ItemProps {
  text: string
  index: number
  columnId: string
  uniqueId: number
  onDeleteTask: () => void
}

const Item: React.FC<ItemProps> = ({ text, index, columnId, uniqueId, onDeleteTask }) => {
  const uniqueDraggableId = `${columnId}-${text}-${uniqueId}`

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
            {text}
            <button 
              onClick={onDeleteTask} 
              className={styles.deleteTaskButton}
              title="Usuń zadanie"
            >
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}

export default Item