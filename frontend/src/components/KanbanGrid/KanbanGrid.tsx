import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import styles from '../../pages/KanbanBoard/KanbanBoard.module.scss';
import TaskItem from '../../components/TaskItem/TaskItem';
import ActionButton from '../../components/ActionButton/ActionButton';

interface KanbanGridProps {
  rows: string[];
  columnOrder: string[];
  columns: Record<string, { wipLimit: number }>;
  taskGrid: Record<string, Record<string, any[]>>;
  isAddingTaskMap: Record<string, boolean>;
  newTaskTitleMap: Record<string, string>;
  countTasksInColumn: (columnId: string) => number;
  handleDeleteRow: (rowId: string) => void;
  handleStartAddingTask: (rowId: string, columnId: string) => void;
  handleTaskTitleChange: (rowId: string, columnId: string, title: string) => void;
  handleAddTaskSubmit: (rowId: string, columnId: string) => void;
  handleCancelAddingTask: (rowId: string, columnId: string) => void;
  onDeleteTaskFromCell: (rowId: string, columnId: string, taskId: string) => void;
  handleTaskUpdate: (rowId: string, columnId: string, taskId: string, updatedData: any) => void;
}

const KanbanGrid: React.FC<KanbanGridProps> = ({
  rows,
  columnOrder,
  columns,
  taskGrid,
  isAddingTaskMap,
  newTaskTitleMap,
  countTasksInColumn,
  handleDeleteRow,
  handleStartAddingTask,
  handleTaskTitleChange,
  handleAddTaskSubmit,
  handleCancelAddingTask,
  onDeleteTaskFromCell,
  handleTaskUpdate
}) => {
  return (
    <div className={styles.gridRows}>
      {rows.map((rowId) => (
        <div key={rowId} className={styles.gridRow}>
          <div className={styles.rowLabel}>
            {rowId}
            {rowId !== "Default" && (
              <button
                onClick={() => handleDeleteRow(rowId)}
                className={styles.deleteRowButton}
                title="Usuń wiersz"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            )}
          </div>

          <div className={styles.rowCells}>
            {columnOrder.map((columnId) => {
              const column = columns[columnId];
              if (!column) return null;

              // Ensure the cell exists in the taskGrid
              if (!taskGrid[rowId]) {
                taskGrid[rowId] = {};
              }
              if (!taskGrid[rowId][columnId]) {
                taskGrid[rowId][columnId] = [];
              }

              const isAddingTaskToThisCell = !!isAddingTaskMap[`${rowId}-${columnId}`];
              const newTaskTitleForCell = newTaskTitleMap[`${rowId}-${columnId}`] || "";
              const columnHasSpace = column.wipLimit === 0 || countTasksInColumn(columnId) < column.wipLimit;

              return (
                <div key={`${rowId}-${columnId}`} className={styles.gridCell}>
                  <Droppable droppableId={`${rowId}-${columnId}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`${styles.cellContent} ${
                          snapshot.isDraggingOver ? styles.draggingOver : ""
                        } ${
                          column.wipLimit > 0 && countTasksInColumn(columnId) >= column.wipLimit 
                            ? styles.limitReached 
                            : ""
                        }`}
                      >
                        {taskGrid[rowId][columnId].map((task, index) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            index={index}
                            columnId={columnId}
                            onDeleteTask={() => onDeleteTaskFromCell(rowId, columnId, task.id)}
                            onTaskUpdate={(updatedData) => handleTaskUpdate(rowId, columnId, task.id, updatedData)}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {isAddingTaskToThisCell ? (
                    <div className={styles.addTaskForm}>
                      <input
                        type="text"
                        value={newTaskTitleForCell}
                        onChange={(e) => handleTaskTitleChange(rowId, columnId, e.target.value)}
                        placeholder="Nazwa zadania"
                        className={styles.taskInput}
                        autoFocus
                      />
                      <div className={styles.addTaskActions}>
                        <ActionButton
                          onClick={() => handleAddTaskSubmit(rowId, columnId)}
                          variant="success"
                          disabled={!newTaskTitleForCell.trim()}
                        >
                          Dodaj
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleCancelAddingTask(rowId, columnId)}
                          variant="default"
                        >
                          Anuluj
                        </ActionButton>
                      </div>
                    </div>
                  ) : (
                    columnHasSpace && (
                      <button
                        onClick={() => handleStartAddingTask(rowId, columnId)}
                        className={styles.addTaskButton}
                      >
                        <i className="bi bi-plus-circle"></i> Dodaj zadanie
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanGrid;
