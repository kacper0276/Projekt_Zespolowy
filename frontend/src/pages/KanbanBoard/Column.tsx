import React, { useState } from 'react'
import Item from './TaskItem'
import { Droppable } from '@hello-pangea/dnd'
import styles from './Column.module.scss'

type TaskData = {
  id: string
  title: string
}

interface ColumnProps {
  col: {
    id: string
    title: string
    tasks: TaskData[]
    uniqueCounter: number
    wipLimit: number
  }
  onAddTask: (columnId: string, taskTitle: string) => void
  onDeleteTask: (columnId: string, taskIndex: number) => void
  onDeleteColumn: () => void
  canDeleteColumn: boolean
  updateWipLimit: (columnId: string, limit: number) => void
  canAddTask: boolean
}

const Column: React.FC<ColumnProps> = ({
  col,
  onAddTask,
  onDeleteTask,
  onDeleteColumn,
  canDeleteColumn,
  updateWipLimit,
  canAddTask
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isEditingWipLimit, setIsEditingWipLimit] = useState(false)
  const [tempWipLimit, setTempWipLimit] = useState(col.wipLimit.toString())

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(col.id, newTaskTitle.trim())
      setNewTaskTitle('')
      setIsAddingTask(false)
    }
  }

  const handleWipLimitChange = () => {
    const newLimit = parseInt(tempWipLimit, 10)
    if (isNaN(newLimit) || newLimit < 0) {
      // Display error toast
      return
    }
    
    updateWipLimit(col.id, newLimit)
    setIsEditingWipLimit(false)
  }

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h3>{col.title}</h3>
        <div className={styles.columnHeaderActions}>
          <span className={`badge ${styles.taskCount}`}>
            {col.tasks.length}{col.wipLimit > 0 && `/${col.wipLimit}`}
          </span>
          {canDeleteColumn && (
            <button
              onClick={onDeleteColumn}
              className={styles.deleteColumnButton}
              title="Usuń kolumnę"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.wipLimitSection}>
        {isEditingWipLimit ? (
          <div className={styles.wipLimitEditor}>
            <input
              type="number"
              min="0"
              value={tempWipLimit}
              onChange={(e) => setTempWipLimit(e.target.value)}
              className={styles.wipLimitInput}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleWipLimitChange();
                if (e.key === 'Escape') setIsEditingWipLimit(false);
              }}
            />
            <div className={styles.wipLimitButtons}>
              <button 
                onClick={handleWipLimitChange} 
                className={styles.confirmWipButton} 
                title="Zapisz"
              >
                <i className="bi bi-check-lg"></i>
              </button>
              <button 
                onClick={() => setIsEditingWipLimit(false)} 
                className={styles.cancelWipButton}
                title="Anuluj"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={`${styles.wipLimitDisplay} ${col.wipLimit > 0 && col.tasks.length >= col.wipLimit ? styles.limitReached : ''}`}
            onClick={() => {
              setTempWipLimit(col.wipLimit.toString())
              setIsEditingWipLimit(true)
            }}
            title="Kliknij, aby edytować limit zadań"
          >
            <span>
              WIP Limit: {col.wipLimit === 0 ? "Brak" : col.wipLimit}
            </span>
            <i className="bi bi-pencil-fill ms-2"></i>
          </div>
        )}
      </div>
      
      <div className={styles.columnActions}>
        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className={`btn ${styles.addTaskButton} ${!canAddTask ? styles.disabled : ''}`}
          disabled={!canAddTask}
        >
          Dodaj zadanie
        </button>
      </div>
      
      {isAddingTask && (
        <div className={styles.inlineTaskInput}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Wpisz tytuł zadania"
            className={`form-control ${styles.taskInput}`}
          />
          <div className={styles.confirmTaskActions}>
            <button
              onClick={handleAddTask}
              className={`btn ${styles.confirmTaskButton}`}
              disabled={!newTaskTitle.trim()}
            >
              Dodaj
            </button>
            <button
              onClick={() => setIsAddingTask(false)}
              className={`btn ${styles.cancelButton}`}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
      
      <Droppable droppableId={col.id}>
        {provided => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={styles.columnContent}
          >
            {col.tasks.map((task, index) => (
              <Item
                key={`${col.id}-${task.id}-${index}`}
                text={task.title}
                index={index}
                columnId={col.id}
                uniqueId={col.uniqueCounter - index}
                onDeleteTask={() => onDeleteTask(col.id, index)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default Column