import React, { useState } from 'react'
import Item from './TaskItem'
import { Droppable } from '@hello-pangea/dnd'
import styles from './Column.module.scss'

type TaskData = {
  id: string
  title: string
  status: 'idle' | 'inProgress'
}

interface ColumnProps {
  col: {
    id: string
    tasks: TaskData[]
    uniqueCounter: number
  }
  columns: string[]
  onAddTask: (columnId: string, taskTitle: string) => void
  onDeleteTask: (columnId: string, taskIndex: number) => void
  onToggleTaskStatus: (columnId: string, taskIndex: number) => void
  onDeleteColumn: () => void
  canDeleteColumn: boolean
  maxInProgressTasks: number
  currentInProgressTasks: number
}

const Column: React.FC<ColumnProps> = ({
  col: { tasks, id, uniqueCounter },
  columns,
  onAddTask,
  onDeleteTask,
  onToggleTaskStatus,
  onDeleteColumn,
  canDeleteColumn,
  maxInProgressTasks,
  currentInProgressTasks
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(id, newTaskTitle.trim())
      setNewTaskTitle('')
      setIsAddingTask(false)
    }
  }

  return (
    <Droppable droppableId={id}>
      {provided => (
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h3>{id.charAt(0).toUpperCase() + id.slice(1)}</h3>
            <div className={styles.columnHeaderActions}>
              <span className={`badge ${styles.taskCount}`}>{tasks.length}</span>
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
          <div className={styles.columnActions}>
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className={`btn ${styles.addTaskButton}`}
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
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={styles.columnContent}
          >
            {tasks.map((task, index) => (
              <Item
                key={`${id}-${task.id}-${index}`}
                text={task.title}
                index={index}
                columnId={id}
                uniqueId={uniqueCounter - index}
                status={task.status}
                onDeleteTask={() => onDeleteTask(id, index)}
                onToggleStatus={() => onToggleTaskStatus(id, index)}
                canToggleToInProgress={task.status === 'inProgress' || currentInProgressTasks < maxInProgressTasks}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}

export default Column