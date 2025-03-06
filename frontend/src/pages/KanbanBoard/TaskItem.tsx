import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import styles from './TaskItem.module.scss'

interface ItemProps {
  text: string
  index: number
  columnId: string
  uniqueId: number
  status: 'idle' | 'inProgress'
  onDeleteTask: () => void
  onToggleStatus: () => void
  canToggleToInProgress: boolean
}

const Item: React.FC<ItemProps> = ({ 
  text, 
  index, 
  columnId, 
  uniqueId, 
  status,
  onDeleteTask,
  onToggleStatus,
  canToggleToInProgress
}) => {
  const uniqueDraggableId = `${columnId}-${text}-${uniqueId}`
  
  return (
    <Draggable draggableId={uniqueDraggableId} index={index}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${styles.item} ${status === 'inProgress' ? styles.inProgress : ''}`}
        >
          <div className={styles.taskContent}>
            <span className={styles.taskText}>{text}</span>
            <div className={styles.taskActions}>
              <div 
                className={styles.statusToggleContainer}
                title={status === 'inProgress' ? 'Kliknij, aby oznaczyć jako niewykonywane' : 
                  canToggleToInProgress ? 'Kliknij, aby oznaczyć jako wykonywane' : 'Osiągnięto limit zadań w trakcie wykonywania'}
              >
                <button 
                  onClick={onToggleStatus}
                  className={`${styles.statusToggle} ${!canToggleToInProgress && status === 'idle' ? styles.disabled : ''}`}
                  disabled={!canToggleToInProgress && status === 'idle'}
                >
                  <div className={`${styles.toggleSlider} ${status === 'inProgress' ? styles.active : ''}`}>
                    <div className={styles.toggleHandle}></div>
                  </div>
                  <span className={styles.statusLabel}>
                    {status === 'inProgress' ? 'Wykonywane' : 'Niewykonywane'}
                  </span>
                </button>
              </div>
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