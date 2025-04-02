import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useApiJson } from "../config/api";
import { ApiResponse } from "../types/api.types";
import { IColumnEntity } from "../interfaces/IColumnEntity";

interface ColumnState {
  [key: string]: {
    id: string;
    title: string;
    tasks: any[];
    wipLimit: number;
    columnId?: number; // Store the actual database ID
  };
}

export function useColumn() {
  const [columns, setColumns] = useState<ColumnState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const api = useApiJson();

  // Initialize columns from API data
  const initializeColumns = useCallback((columnsData: IColumnEntity[]) => {
    const initialColumns: ColumnState = {};
    const initialColumnOrder: string[] = [];

    // Sort columns by order
    const sortedColumns = [...columnsData].sort((a, b) => a.order - b.order);

    sortedColumns.forEach((column) => {
      const columnId = column.name.toLowerCase().replace(/\s+/g, "");

      initialColumns[columnId] = {
        id: columnId,
        title: column.name,
        tasks: (column.tasks || [])
          .sort((a, b) => a.order - b.order)
          .map((task) => ({
            id: `task-${task.id || Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            content: task.name,
            name: task.name,
            description: task.description,
            status: task.status,
            priority: task.priority,
            deadline: task.deadline,
            users: task.users || [],
            dbId: task.id,
          })),
        wipLimit: column.maxTasks || 0,
        columnId: column.id,
      };

      initialColumnOrder.push(columnId);
    });

    setColumns(initialColumns);
    setColumnOrder(initialColumnOrder);
  }, []);

  // Update WIP limit for a column
  const updateColumnWipLimit = async (columnId: string, limit: number) => {
    if (limit < 0) {
      toast.error("Limit zadań nie może być ujemny!");
      return;
    }

    const column = columns[columnId];
    if (!column || !column.columnId) {
      toast.error(
        "Nie można zaktualizować limitu - brak identyfikatora kolumny!"
      );
      return;
    }

    try {
      await api.patch(`columns/edit-wip-limit/${column.columnId}`, {
        maxTasks: limit,
      });

      setColumns((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          wipLimit: limit,
        },
      }));

      toast.success(
        `Zmieniono limit zadań dla kolumny ${columns[columnId].title}`
      );
    } catch (error) {
      console.error("Error updating column WIP limit:", error);
      toast.error("Nie udało się zaktualizować limitu zadań.");
    }
  };

  // Add a new column
  const addColumn = async (kanbanId?: number) => {
    if (!newColumnTitle.trim() || !kanbanId) return;

    const columnId = newColumnTitle.toLowerCase().replace(/\s+/g, "");

    if (columns[columnId]) {
      toast.error("Kolumna o tej nazwie już istnieje!");
      return;
    }

    try {
      const newColumnResponse = await api.post<ApiResponse<IColumnEntity>>(
        `columns/${kanbanId}`,
        {
          name: newColumnTitle,
        }
      );

      const newColumn = {
        id: columnId,
        title: newColumnTitle,
        tasks: [],
        wipLimit: 0,
        columnId: newColumnResponse.data.data?.id,
      };

      setColumns((prev) => ({
        ...prev,
        [columnId]: newColumn,
      }));

      setColumnOrder((prev) => [...prev, columnId]);
      setNewColumnTitle("");

      toast.success(`Dodano kolumnę ${newColumnTitle}`);
    } catch (error) {
      console.error("Error creating column:", error);
      toast.error("Nie udało się dodać kolumny. Spróbuj ponownie później.");
    }
  };

  // Update column order
  const updateColumnOrder = async (kanbanId: number, newOrder: string[]) => {
    try {
      const orderData = newOrder.map((columnId, index) => ({
        columnId: columns[columnId].columnId,
        order: index,
      }));

      await api.patch(`columns/edit-order/${kanbanId}`, orderData);

      setColumnOrder(newOrder);
      toast.success("Zaktualizowano kolejność kolumn");
    } catch (error) {
      console.error("Error updating column order:", error);
      toast.error("Nie udało się zaktualizować kolejności kolumn.");
    }
  };

  // Delete a column
  const deleteColumn = async (columnId: string) => {
    if (["todo", "inprogress", "done"].includes(columnId)) {
      toast.error("Nie można usunąć domyślnej kolumny!");
      return null;
    }

    // Get the column's database ID
    const columnDbId = columns[columnId]?.columnId;

    if (!columnDbId) {
      toast.error(
        "Nie można usunąć kolumny - brak identyfikatora w bazie danych!"
      );
      return null;
    }

    try {
      const columnIndex = columnOrder.indexOf(columnId);
      const prevColumnIndex = Math.max(0, columnIndex - 1);
      const prevColumnId = columnOrder[prevColumnIndex];

      // Get the tasks from the column being deleted
      const tasksToMove = [...columns[columnId].tasks];

      await api.delete(`columns/${columnDbId}`);
      const updatedColumns = { ...columns };

      // Dodaj unikalne ID do przenoszonych zadań, aby uniknąć duplikacji
      const uniqueTaskIds = new Set(
        updatedColumns[prevColumnId].tasks.map((task) => task.id)
      );
      const uniqueTasksToMove = tasksToMove.filter(
        (task) => !uniqueTaskIds.has(task.id)
      );

      if (uniqueTasksToMove.length > 0) {
        updatedColumns[prevColumnId] = {
          ...updatedColumns[prevColumnId],
          tasks: [...updatedColumns[prevColumnId].tasks, ...uniqueTasksToMove],
        };
      }

      delete updatedColumns[columnId];

      setColumns(updatedColumns);
      setColumnOrder((prev) => prev.filter((id) => id !== columnId));

      toast.success(
        `Usunięto kolumnę ${columns[columnId].title}. Zadania zostały przeniesione do kolumny ${columns[prevColumnId].title}.`
      );

      return {
        deletedColumnId: columnId,
        prevColumnId: prevColumnId,
        tasksToMove: uniqueTasksToMove,
      };
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Nie udało się usunąć kolumny. Spróbuj ponownie później.");
      return null;
    }
  };

  // Check if adding a task would violate WIP limits
  const canAddTaskToColumn = (columnId: string) => {
    const column = columns[columnId];
    if (!column) return false;

    if (column.wipLimit === 0) return true;

    return column.tasks.length < column.wipLimit;
  };

  // Check if moving a task would violate WIP limits
  const checkWipLimitForMove = (
    sourceColumnId: string,
    destinationColumnId: string
  ) => {
    if (sourceColumnId === destinationColumnId) return true;

    const destColumn = columns[destinationColumnId];
    if (destColumn.wipLimit === 0) return true;

    if (destColumn.tasks.length >= destColumn.wipLimit) {
      toast.error(`Kolumna ${destColumn.title} osiągnęła limit zadań!`);
      return false;
    }

    return true;
  };

  return {
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
  };
}
