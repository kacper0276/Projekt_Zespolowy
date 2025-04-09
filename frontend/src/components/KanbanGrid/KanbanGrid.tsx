import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import styles from "./KanbanGrid.module.scss";
import TaskItem from "../../components/TaskItem/TaskItem";
import ActionButton from "../../components/ActionButton/ActionButton";
import RowHeader from "../../components/RowHeader/RowHeader";
import { IStatus } from "../../interfaces/IStatus";

interface KanbanGridProps {
  rows: Record<
    string,
    {
      wipLimit: number;
      rowId?: number;
      name?: string;
      title: string;
    }
  >;
  rowOrder: string[];
  columnOrder: string[];
  statuses?: IStatus[];
  columns: Record<string, { wipLimit: number }>;
  taskGrid: Record<string, Record<string, any[]>>;
  isAddingTaskMap: Record<string, boolean>;
  newTaskTitleMap: Record<string, string>;
  countTasksInColumn: (columnId: string) => number;
  handleDeleteRow: (rowId: string) => void;
  handleStartAddingTask: (rowId: string, columnId: string) => void;
  handleTaskTitleChange: (
    rowId: string,
    columnId: string,
    title: string
  ) => void;
  handleAddTaskSubmit: (rowId: string, columnId: string) => void;
  handleCancelAddingTask: (rowId: string, columnId: string) => void;
  onDeleteTaskFromCell: (
    rowId: string,
    columnId: string,
    taskId: string
  ) => void;
  handleTaskUpdate: (
    rowId: string,
    columnId: string,
    taskId: string,
    updatedData: any
  ) => void;
  handleRowWipLimitUpdate: (rowId: string, newWipLimit: number) => void;
}

const KanbanGrid: React.FC<KanbanGridProps> = ({
  rows,
  rowOrder,
  columnOrder,
  columns,
  taskGrid,
  statuses,
  isAddingTaskMap,
  newTaskTitleMap,
  countTasksInColumn,
  handleDeleteRow,
  handleStartAddingTask,
  handleTaskTitleChange,
  handleAddTaskSubmit,
  handleCancelAddingTask,
  onDeleteTaskFromCell,
  handleTaskUpdate,
  handleRowWipLimitUpdate,
}) => {
  const confirmDeleteTask = (
    rowId: string,
    columnId: string,
    taskId: string,
    taskName: string
  ) => {
    if (
      window.confirm(
        `Czy na pewno chcesz usunąć zadanie "${taskName}"? Ta operacja jest nieodwracalna.`
      )
    ) {
      onDeleteTaskFromCell(rowId, columnId, taskId);
    }
  };
  return (
    <div className={styles.gridRows}>
      {rowOrder.map((rowId) => {
        const row = rows[rowId];
        if (!row) return null;

        return (
          <div key={rowId} className={styles.gridRow}>
            <RowHeader
              rowId={rowId}
              rowTitle={row.title}
              wipLimit={row.wipLimit}
              handleDeleteRow={handleDeleteRow}
              isDefaultRow={
                rowId === "Default" || row.title.toLowerCase() === "default"
              }
              onWipLimitUpdate={(newWipLimit) =>
                handleRowWipLimitUpdate(rowId, newWipLimit)
              }
              currentTaskCount={
                Object.values(taskGrid[rowId] || {}).flat().length
              }
              rowDbId={row.rowId}
            />

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

                const isAddingTaskToThisCell =
                  !!isAddingTaskMap[`${rowId}-${columnId}`];
                const newTaskTitleForCell =
                  newTaskTitleMap[`${rowId}-${columnId}`] || "";
                const columnHasSpace =
                  column.wipLimit === 0 ||
                  countTasksInColumn(columnId) < column.wipLimit;
                const rowHasSpace =
                  row.wipLimit === 0 ||
                  (taskGrid[rowId] &&
                    Object.values(taskGrid[rowId]).flat().length <
                      row.wipLimit);
                const canAddTask = columnHasSpace && rowHasSpace;

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
                            column.wipLimit > 0 &&
                            countTasksInColumn(columnId) >= column.wipLimit
                              ? styles.limitReached
                              : ""
                          } ${
                            row.wipLimit > 0 &&
                            Object.values(taskGrid[rowId]).flat().length >=
                              row.wipLimit
                              ? styles.rowLimitReached
                              : ""
                          }`}
                        >
                          {taskGrid[rowId][columnId].map((task, index) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              index={index}
                              columnId={columnId}
                              onDeleteTask={() =>
                                confirmDeleteTask(
                                  rowId,
                                  columnId,
                                  task.id,
                                  task.name
                                )
                              }
                              onTaskUpdate={(updatedData) =>
                                handleTaskUpdate(
                                  rowId,
                                  columnId,
                                  task.id,
                                  updatedData
                                )
                              }
                              statuses={statuses}
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
                          onChange={(e) =>
                            handleTaskTitleChange(
                              rowId,
                              columnId,
                              e.target.value
                            )
                          }
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
                            onClick={() =>
                              handleCancelAddingTask(rowId, columnId)
                            }
                            variant="default"
                          >
                            Anuluj
                          </ActionButton>
                        </div>
                      </div>
                    ) : (
                      canAddTask && (
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
        );
      })}
    </div>
  );
};

export default KanbanGrid;
