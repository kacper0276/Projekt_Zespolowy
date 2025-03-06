import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import Column from './Column'
import styles from './KanbanBoard.module.scss'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type TaskData = {
  id: string
  title: string
  status: 'idle' | 'inProgress'
}

type ColumnData = {
  id: string
  tasks: TaskData[]
  uniqueCounter: number
}

type ColumnsState = {
  [key: string]: ColumnData
}

function KanbanBoard() {
  const [newColumnTitle, setNewColumnTitle] = useState<string>('')
  const [columns, setColumns] = useState<ColumnsState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [inProgressTasksCount, setInProgressTasksCount] = useState<number>(0)
  
  // Task limit configuration
  const [maxInProgressTasks, setMaxInProgressTasks] = useState<number>(5)
  const [isEditingLimit, setIsEditingLimit] = useState<boolean>(false)
  const [tempLimit, setTempLimit] = useState<string>('5')

  // Update inProgressTasksCount whenever columns change
  useEffect(() => {
    let count = 0
    Object.values(columns).forEach(column => {
      column.tasks.forEach(task => {
        if (task.status === 'inProgress') {
          count++
        }
      })
    })
    setInProgressTasksCount(count)
  }, [columns])

  const handleLimitChange = () => {
    const newLimit = parseInt(tempLimit, 10)
    if (isNaN(newLimit) || newLimit < 1) {
      toast.error('Limit musi być liczbą większą niż 0', {
        position: "top-center",
        autoClose: 3000
      })
      return
    }
    
    setMaxInProgressTasks(newLimit)
    setIsEditingLimit(false)
    
    // If the new limit is lower than current in-progress tasks, show a warning
    if (newLimit < inProgressTasksCount) {
      toast.warning(`Masz obecnie ${inProgressTasksCount} zadań w trakcie wykonywania. Niektóre zadania powinny zostać oznaczone jako niewykonywane.`, {
        position: "top-center",
        autoClose: 5000
      })
    }
  }

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      const normalizedColumnName = newColumnTitle.trim().toLowerCase()
      const uniqueColumnName = Object.keys(columns).includes(normalizedColumnName)
        ? `${normalizedColumnName}_${Object.keys(columns).length}`
        : normalizedColumnName

      setColumns(prev => ({
        ...prev,
        [uniqueColumnName]: { id: uniqueColumnName, tasks: [], uniqueCounter: 0 }
      }))
      setColumnOrder(prev => [...prev, uniqueColumnName])
      setNewColumnTitle('')
    }
  }

  const deleteColumn = (columnId: string) => {
    setColumns(prev => {
      const newColumns = { ...prev }
      delete newColumns[columnId]
      return newColumns
    })
    setColumnOrder(prev => prev.filter(id => id !== columnId))
  }

  const onAddTask = (columnId: string, taskTitle: string) => {
    setColumns(prev => {
      const column = prev[columnId]
      const newTask: TaskData = {
        id: `task-${column.uniqueCounter}`,
        title: taskTitle,
        status: 'idle'
      }
      
      return {
        ...prev,
        [columnId]: { 
          ...column, 
          tasks: [...column.tasks, newTask],
          uniqueCounter: column.uniqueCounter + 1
        }
      }
    })
  }

  const onDeleteTask = (columnId: string, taskIndex: number) => {
    setColumns(prev => {
      const column = prev[columnId]
      const newTasks = column.tasks.filter((_, index) => index !== taskIndex)
      return {
        ...prev,
        [columnId]: { 
          ...column, 
          tasks: newTasks
        }
      }
    })
  }

  const onToggleTaskStatus = (columnId: string, taskIndex: number) => {
    setColumns(prev => {
      const column = prev[columnId]
      const task = column.tasks[taskIndex]
      
      if (task.status === 'idle' && inProgressTasksCount >= maxInProgressTasks) {
        toast.error(`Nie można mieć więcej niż ${maxInProgressTasks} zadań w trakcie wykonywania jednocześnie!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return prev;
      }
      
      const newTasks = [...column.tasks]
      newTasks[taskIndex] = {
        ...task,
        status: task.status === 'idle' ? 'inProgress' : 'idle'
      }
      
      return {
        ...prev,
        [columnId]: {
          ...column,
          tasks: newTasks
        }
      }
    })
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return

    if (type === 'COLUMN') {
      if (destination.index === source.index) return
      const newColumnOrder = Array.from(columnOrder)
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1)
      newColumnOrder.splice(destination.index, 0, reorderedColumn)
      setColumnOrder(newColumnOrder)
      return
    }

    const sourceColumn = columns[source.droppableId]
    const destColumn = columns[destination.droppableId]

    if (sourceColumn === destColumn) {
      const newTasks = Array.from(sourceColumn.tasks)
      const [removed] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, removed)

      setColumns(prev => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, tasks: newTasks }
      }))
    } else {
      const sourceTasks = Array.from(sourceColumn.tasks)
      const destTasks = Array.from(destColumn.tasks)
      const [removed] = sourceTasks.splice(source.index, 1)
      destTasks.splice(destination.index, 0, removed)

      setColumns(prev => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, tasks: sourceTasks },
        [destColumn.id]: { ...destColumn, tasks: destTasks }
      }))
    }
  }

  return (
    <div className={styles.kanbanBoard}>
      <ToastContainer theme="dark" />
      <div className={styles.boardHeader}>
        <h1>Tablica Kanban</h1>
        <div className={styles.inProgressInfo}>
          <div className={styles.limitEditor}>
            {isEditingLimit ? (
              <div className={styles.limitInputGroup}>
                <input
                  type="number"
                  min="1"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  className={styles.limitInput}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLimitChange();
                    if (e.key === 'Escape') setIsEditingLimit(false);
                  }}
                />
                <div className={styles.limitButtons}>
                  <button 
                    onClick={handleLimitChange} 
                    className={styles.confirmLimitButton} 
                    title="Zapisz"
                  >
                    <i className="bi bi-check-lg"></i>
                  </button>
                  <button 
                    onClick={() => setIsEditingLimit(false)} 
                    className={styles.cancelLimitButton}
                    title="Anuluj"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            ) : (
              <span 
                className={`${styles.inProgressCount} ${inProgressTasksCount >= maxInProgressTasks ? styles.limitReached : ''}`}
                onClick={() => {
                  setTempLimit(maxInProgressTasks.toString());
                  setIsEditingLimit(true);
                }}
                title="Kliknij, aby edytować limit zadań"
              >
                Zadania w trakcie wykonywania: {inProgressTasksCount}/{maxInProgressTasks}
                <i className="bi bi-pencil-fill ms-2"></i>
              </span>
            )}
          </div>
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div className={styles.boardContainer} {...provided.droppableProps} ref={provided.innerRef}>
              <div className={styles.boardColumns}>
                {columnOrder.map((columnId, index) => {
                  const column = columns[columnId]
                  return (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(providedColumn) => (
                        <div ref={providedColumn.innerRef} {...providedColumn.draggableProps} {...providedColumn.dragHandleProps}>
                          <Column 
                            col={column} 
                            columns={Object.keys(columns)}
                            onAddTask={onAddTask}
                            onDeleteTask={onDeleteTask}
                            onToggleTaskStatus={onToggleTaskStatus}
                            onDeleteColumn={() => deleteColumn(column.id)}
                            canDeleteColumn={true}
                            maxInProgressTasks={maxInProgressTasks}
                            currentInProgressTasks={inProgressTasksCount}
                          />
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
                <div className={styles.addColumnSection}>
                  <div className={styles.columnCreation}>
                    <input 
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Nazwa nowej kolumny"
                      className={styles.columnInput}
                    />
                    <button onClick={addColumn} className={styles.addColumnButton}>
                      Dodaj kolumnę
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default KanbanBoard