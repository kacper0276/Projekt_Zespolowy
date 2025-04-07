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

  // Inicjalizacja tablicy Kanban z danych API
  const initializeBoard = useCallback(
    (kanbanData: IKanban) => {
      setBoardData(kanbanData);
      initializeColumns(kanbanData.columns);
      initializeRows(kanbanData.rows);
    },
    [initializeColumns, initializeRows]
  );

  
  // Dodawanie zadania do kolumny i wiersza
  const onAddTask = async (
    rowId: string,
    columnId: string,
    taskName: string
  ) => {
    if (!canAddTaskToColumn(columnId)) {
      toast.error(`Kolumna ${columns[columnId].title} osiągnęła limit zadań!`);
      return;
    }

    if (!canAddTaskToRow(rowId)) {
      toast.error(`Wiersz ${rows[rowId].title} osiągnął limit zadań!`);
      return;
    }

    const column = columns[columnId];
    const row = rows[rowId];

    try {
      const taskData = {
        name: taskName,
        description: "",
        status: column.title,
        priority: "normal",
        deadline: new Date(),
        users: [],
        columnId: column.columnId,
        rowId: row.rowId,
        kanbanId: boardData?.id,
      };

      const response = await api.post<ApiResponse<ITask>>(
        "tasks/create-new",
        taskData
      );

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
          rowId: row.rowId,
          columnId: column.columnId,
        };

        setColumns((prev) => ({
          ...prev,
          [columnId]: {
            ...prev[columnId],
            tasks: [...prev[columnId].tasks, newTask],
          },
        }));

        toast.success(`Dodano zadanie do kolumny ${columns[columnId].title}`);
        return newTask;
      }
      return null;
    } catch (error) {
      console.error("Błąd podczas tworzenia zadania:", error);
      toast.error("Nie udało się dodać zadania. Spróbuj ponownie później.");
      return null;
    }
  };

  // Usuwanie zadania
  const onDeleteTask = async (columnId: string, taskId: number) => {

    try {
      if (taskId) {
        await api.delete(`tasks/${taskId}`);
      }

      setColumns((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          tasks: prev[columnId].tasks.filter((task) => task.id !== taskId),
        },
      }));

      toast.success("Usunięto zadanie");
    } catch (error) {
      console.error("Błąd podczas usuwania zadania:", error);
      toast.error("Nie udało się usunąć zadania. Spróbuj ponownie później.");
    }
  };

  // Aktualizacja pozycji zadania
  const updateTaskPosition = async (
    taskId: string,
    _sourceColumnId: string,
    destinationColumnId: string,
    _sourceRowId: string,
    destinationRowId: string
  ) => {
    const taskIdParts = taskId.split("-");
    if (taskIdParts.length < 2) {
      console.error("Nieprawidłowy format ID zadania:", taskId);
      return;
    }

    const dbId = taskIdParts[0];
    const destColumn = columns[destinationColumnId];
    const destRow = rows[destinationRowId];

    if (!dbId || !destColumn.columnId || !destRow.rowId) {
      console.error(
        "Brakuje ID w bazie danych dla zadania, kolumny lub wiersza:",
        {
          taskId,
          dbId,
          destColumnId: destColumn.columnId,
          destRowId: destRow.rowId,
        }
      );
      return;
    }

    try {
      await api.patch<ApiResponse<ITask>>(`tasks/${dbId}/change-row-column`, {
        columnId: destColumn.columnId,
        rowId: destRow.rowId,
      });

      toast.success(
        `Przeniesiono zadanie do ${destColumn.title} w wierszu ${destRow.title}`
      );
    } catch (error) {
      console.error("Błąd podczas aktualizacji pozycji zadania:", error);
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
