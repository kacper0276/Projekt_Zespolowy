import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import Column from './Column'
import styles from './KanbanBoard.module.scss'

type ColumnData = {
  id: string
  list: string[]
  uniqueCounter: number
}

type ColumnsState = {
  [key: string]: ColumnData
}

function KanbanBoard() {
  const [newColumnTitle, setNewColumnTitle] = useState<string>('')
  const [columns, setColumns] = useState<ColumnsState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      const normalizedColumnName = newColumnTitle.trim().toLowerCase()
      const uniqueColumnName = Object.keys(columns).includes(normalizedColumnName)
        ? `${normalizedColumnName}_${Object.keys(columns).length}`
        : normalizedColumnName

      setColumns(prev => ({
        ...prev,
        [uniqueColumnName]: { id: uniqueColumnName, list: [], uniqueCounter: 0 }
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
      return {
        ...prev,
        [columnId]: { 
          ...column, 
          list: [...column.list, taskTitle],
          uniqueCounter: column.uniqueCounter + 1
        }
      }
    })
  }

  const onDeleteTask = (columnId: string, taskIndex: number) => {
    setColumns(prev => {
      const column = prev[columnId]
      const newList = column.list.filter((_, index) => index !== taskIndex)
      return {
        ...prev,
        [columnId]: { 
          ...column, 
          list: newList
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
      const newList = Array.from(sourceColumn.list)
      const [removed] = newList.splice(source.index, 1)
      newList.splice(destination.index, 0, removed)

      setColumns(prev => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, list: newList }
      }))
    } else {
      const sourceList = Array.from(sourceColumn.list)
      const destList = Array.from(destColumn.list)
      const [removed] = sourceList.splice(source.index, 1)
      destList.splice(destination.index, 0, removed)

      setColumns(prev => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, list: sourceList },
        [destColumn.id]: { ...destColumn, list: destList }
      }))
    }
  }

  return (
    <div className={styles.kanbanBoard}>
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
                            onDeleteColumn={() => deleteColumn(column.id)}
                            canDeleteColumn={true}
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