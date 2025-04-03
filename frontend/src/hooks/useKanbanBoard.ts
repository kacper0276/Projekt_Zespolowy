import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { IKanban } from "../interfaces/IKanban";
import { useApiJson } from "../config/api";
import { ApiResponse } from "../types/api.types";
import { ITask } from "../interfaces/ITask";
import { useColumn } from "./useColumn";
import { useRow } from "./useRow";

export function useKanbanBoard() {
  const [boardData, setBoardData] = useState<IKanban | null>(null);
  const api = useApiJson();
  
  const {
    columns,
    setColumns,
    columnOrder,
    setColumnOrder,
    newColumnTitle,
    setNewColumnTitle,
    initializeColumns,
    updateColumnWipLimit,
    addColumn,
    updateColumnOrder,
    deleteColumn,
    canAddTaskToColumn,
    checkWipLimitForMove,
  } = useColumn();
  
  const {
    rows,
    setRows,
    rowOrder,
    setRowOrder,
    newRowTitle,
    setNewRowTitle,
    initializeRows,
    addRow,
    updateRowOrder,
    updateRowWipLimit,
    deleteRow,
    canAddTaskToRow,
    checkRowWipLimitForMove,
  } = useRow();

  // Initialize board from API data
  const initializeBoard = useCallback((kanbanData: IKanban) => {
    setBoardData(kanbanData);
    initializeColumns(kanbanData.columns);
    initializeRows(kanbanData.rows);
  }, [initializeColumns, initializeRows]);

 // Add a task to a column and row
const onAddTask = async (columnId: string, rowId: string, taskName: string) => {
  if (!canAddTaskToColumn(columnId)) {
    toast.error(`Kolumna ${columns[columnId].title} osiągnęła limit zadań!`);
    return;
  }
  
  if (!canAddTaskToRow(rowId)) {
    toast.error(`Wiersz ${rows[rowId].title} osiągnęła limit zadań!`);
    return;
  }

  const column = columns[columnId];
  const row = rows[rowId];

  try {
    // Create task request payload
    const taskData = {
      name: taskName,
      description: "",
      status: column.title,
      priority: "normal",
      deadline: new Date(),
      users: [],
      columnId: column.columnId,
      rowId: row.rowId, // Add the row ID to the request
      kanbanId: boardData?.id,
    };

    // Send request to create task in the database
    const response = await api.post<ApiResponse<ITask>>(
      "tasks/create-new",
      taskData
    );

    // If successful, add to UI with the database ID
    if (response.data && response.data.data) {
      const newTask = {
        id: `task-${response.data.data.id}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        content: taskName,
        name: taskName,
        description: "",
        status: column.title,
        priority: row.title,
        deadline: new Date(),
        users: [],
        dbId: response.data.data.id,
        rowId: row.rowId, // Store the row ID in the task
      };

      setColumns((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          tasks: [...prev[columnId].tasks, newTask],
        },
      }));

      toast.success(`Dodano zadanie do kolumny ${columns[columnId].title}`);
    }
  } catch (error) {
    console.error("Error creating task:", error);
    toast.error("Nie udało się dodać zadania. Spróbuj ponownie później.");
  }
};
  // Delete a task
  const onDeleteTask = async (columnId: string, taskId: string) => {
    const task = columns[columnId].tasks.find((t) => t.id === taskId);
    const dbId = task?.dbId;

    try {
      if (dbId) {
        // Delete from the database
        await api.delete(`tasks/${dbId}`);
      }

      // Remove from UI
      setColumns((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          tasks: prev[columnId].tasks.filter((task) => task.id !== taskId),
        },
      }));

      toast.success("Usunięto zadanie");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Nie udało się usunąć zadania. Spróbuj ponownie później.");
    }
  };

  // Update task position when dragged to another column
  const updateTaskPosition = async (
    taskId: string,
    _sourceColumnId: string,
    destinationColumnId: string
  ) => {
    // Parse the task ID to get the database ID from the format "task-{dbId}-{random}"
    const taskIdParts = taskId.split("-");
    if (taskIdParts.length < 2) {
      console.error("Invalid task ID format:", taskId);
      return;
    }

    // Extract the database ID (second part of the taskId)
    const dbId = taskIdParts[1];
    const destColumn = columns[destinationColumnId];

    if (!dbId || !destColumn.columnId) {
      console.error("Missing DB ID for task or column:", {
        taskId,
        dbId,
        destColumnId: destColumn.columnId,
      });
      return;
    }

    try {
      // Update task's column in the database using the provided endpoint pattern
      await api.patch<ApiResponse<ITask>>(`tasks/${dbId}/change-column`, {
        columnId: destColumn.columnId,
      });

      toast.success(`Przeniesiono zadanie do kolumny ${destColumn.title}`);
    } catch (error) {
      console.error("Error updating task position:", error);
      toast.error("Nie udało się zaktualizować pozycji zadania.");
    }
  };

  return {
    columns,
    setColumns,
    columnOrder,
    setColumnOrder,
    newColumnTitle,
    setNewColumnTitle,
    updateColumnWipLimit,
    addColumn,
    updateColumnOrder,
    deleteColumn,
    canAddTaskToColumn,
    checkWipLimitForMove,
    
    rows,
    setRows,
    rowOrder,
    setRowOrder,
    newRowTitle,
    setNewRowTitle,
    addRow,
    updateRowOrder,
    updateRowWipLimit,
    deleteRow,
    canAddTaskToRow,
    checkRowWipLimitForMove,
    
    onAddTask,
    onDeleteTask,
    updateTaskPosition,
    initializeBoard,
    boardData,
    setBoardData,
  };
}