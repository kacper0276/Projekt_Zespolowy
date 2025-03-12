import React, { useState, useEffect, use } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Column from "./Column";
import styles from "./KanbanBoard.module.scss";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { UserType } from "../../interfaces/IUser";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";

type TaskData = {
  id: string;
  title: string;
};

type ColumnData = {
  id: string;
  title: string;
  tasks: TaskData[];
  uniqueCounter: number;
  wipLimit: number;
};

type ColumnsState = {
  [key: string]: ColumnData;
};

function KanbanBoard() {
  useWebsiteTitle("Kanban Board");
  const api = useApiJson();

  const [newColumnTitle, setNewColumnTitle] = useState<string>("");
  const [columns, setColumns] = useState<ColumnsState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  // Initialize with default columns
  useEffect(() => {
    if (Object.keys(columns).length === 0) {
      const initialColumns: ColumnsState = {
        todo: {
          id: "todo",
          title: "To Do",
          tasks: [],
          uniqueCounter: 0,
          wipLimit: 0, // 0 means no limit
        },
        inprogress: {
          id: "inprogress",
          title: "In Progress",
          tasks: [],
          uniqueCounter: 0,
          wipLimit: 5, // Default WIP limit for In Progress
        },
        done: {
          id: "done",
          title: "Done",
          tasks: [],
          uniqueCounter: 0,
          wipLimit: 0, // No limit
        },
      };
      setColumns(initialColumns);
      setColumnOrder(["todo", "inprogress", "done"]);

      api.get<ApiResponse<UserType[]>>("users/all").then((response) => {
        setUsers(response.data.data ?? []);
      });
    }
  }, []);

  const updateColumnWipLimit = (columnId: string, newLimit: number) => {
    setColumns((prev) => {
      const column = prev[columnId];
      return {
        ...prev,
        [columnId]: {
          ...column,
          wipLimit: newLimit,
        },
      };
    });
  };

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      // Create a normalized ID for the column
      const normalizedColumnId = newColumnTitle
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const uniqueColumnId = Object.keys(columns).includes(normalizedColumnId)
        ? `${normalizedColumnId}-${Object.keys(columns).length}`
        : normalizedColumnId;

      setColumns((prev) => ({
        ...prev,
        [uniqueColumnId]: {
          id: uniqueColumnId,
          title: newColumnTitle.trim(),
          tasks: [],
          uniqueCounter: 0,
          wipLimit: 0, // Default no limit for new columns
        },
      }));
      setColumnOrder((prev) => [...prev, uniqueColumnId]);
      setNewColumnTitle("");
    }
  };

  const deleteColumn = (columnId: string) => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      delete newColumns[columnId];
      return newColumns;
    });
    setColumnOrder((prev) => prev.filter((id) => id !== columnId));
  };

  const canAddTaskToColumn = (columnId: string) => {
    const column = columns[columnId];
    // If wipLimit is 0, there's no limit
    if (column.wipLimit === 0) return true;

    // Otherwise, check if we're below the limit
    return column.tasks.length < column.wipLimit;
  };

  const onAddTask = (columnId: string, taskTitle: string) => {
    // Check if adding would exceed WIP limit
    if (!canAddTaskToColumn(columnId)) {
      toast.error(
        `Nie można dodać zadania do kolumny "${columns[columnId].title}" - osiągnięto limit WIP (${columns[columnId].wipLimit})`,
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
      return;
    }

    setColumns((prev) => {
      const column = prev[columnId];
      const newTask: TaskData = {
        id: `task-${column.uniqueCounter}`,
        title: taskTitle,
      };

      return {
        ...prev,
        [columnId]: {
          ...column,
          tasks: [...column.tasks, newTask],
          uniqueCounter: column.uniqueCounter + 1,
        },
      };
    });
  };

  const onDeleteTask = (columnId: string, taskIndex: number) => {
    setColumns((prev) => {
      const column = prev[columnId];
      const newTasks = column.tasks.filter((_, index) => index !== taskIndex);
      return {
        ...prev,
        [columnId]: {
          ...column,
          tasks: newTasks,
        },
      };
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    // Handle column reordering
    if (type === "COLUMN") {
      if (destination.index === source.index) return;
      const newColumnOrder = Array.from(columnOrder);
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedColumn);
      setColumnOrder(newColumnOrder);
      return;
    }

    // Handle task reordering
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // If moving to a different column, check WIP limit
    if (
      sourceColumn.id !== destColumn.id &&
      destColumn.wipLimit > 0 &&
      destColumn.tasks.length >= destColumn.wipLimit
    ) {
      toast.error(
        `Nie można przenieść zadania do kolumny "${destColumn.title}" - osiągnięto limit WIP (${destColumn.wipLimit})`,
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
      return;
    }

    if (sourceColumn === destColumn) {
      // Moving within the same column
      const newTasks = Array.from(sourceColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      setColumns((prev) => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, tasks: newTasks },
      }));
    } else {
      // Moving to a different column
      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);

      setColumns((prev) => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, tasks: sourceTasks },
        [destColumn.id]: { ...destColumn, tasks: destTasks },
      }));
    }
  };

  return (
    <div className={styles.kanbanBoard}>
      <ToastContainer theme="dark" />
      <div className={styles.boardHeader}>
        <h1>Tablica Kanban</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div
              className={styles.boardContainer}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className={styles.boardColumns}>
                {columnOrder.map((columnId, index) => {
                  const column = columns[columnId];
                  if (!column) return null;

                  return (
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={index}
                    >
                      {(providedColumn) => (
                        <div
                          ref={providedColumn.innerRef}
                          {...providedColumn.draggableProps}
                          {...providedColumn.dragHandleProps}
                        >
                          <Column
                            col={column}
                            onAddTask={onAddTask}
                            onDeleteTask={onDeleteTask}
                            onDeleteColumn={() => deleteColumn(column.id)}
                            canDeleteColumn={
                              !["todo", "inprogress", "done"].includes(
                                column.id
                              )
                            }
                            updateWipLimit={updateColumnWipLimit}
                            canAddTask={canAddTaskToColumn(column.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
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
                    <button
                      onClick={addColumn}
                      className={styles.addColumnButton}
                    >
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
  );
}

export default KanbanBoard;
