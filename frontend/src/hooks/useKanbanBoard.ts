import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { IKanban } from "../interfaces/IKanban";
import { useApiJson } from "../config/api";
import { ApiResponse } from "../types/api.types";
import { ITask } from "../interfaces/ITask";
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

export function useKanbanBoard() {
  const [columns, setColumns] = useState<ColumnState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [boardData, setBoardData] = useState<IKanban | null>(null);
  const api = useApiJson();

  // Initialize board from API data
  const initializeBoard = useCallback((kanbanData: IKanban) => {
    setBoardData(kanbanData);

    const initialColumns: ColumnState = {};
    const initialColumnOrder: string[] = [];

    // Sort columns by order
    const sortedColumns = [...kanbanData.columns].sort(
      (a, b) => a.order - b.order
    );

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
  const updateColumnWipLimit = (columnId: string, limit: number) => {
    if (limit < 0) {
      toast.error("Limit zadań nie może być ujemny!");
      return;
    }

    setColumns((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        wipLimit: limit,
      },
    }));

    // Here you would also update this on the backend
    toast.success(
      `Zmieniono limit zadań dla kolumny ${columns[columnId].title}`
    );
  };

  // Add a new column
  const addColumn = async () => {
    if (!newColumnTitle.trim()) return;

    const newColumnResponse = await api.post<ApiResponse<IColumnEntity>>(
      `columns/${boardData?.id}`,
      {
        name: newColumnTitle,
      }
    );

    const columnId = newColumnTitle.toLowerCase().replace(/\s+/g, "");

    if (columns[columnId]) {
      toast.error("Kolumna o tej nazwie już istnieje!");
      return;
    }

    const newColumn = {
      id: newColumnTitle,
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
  };

  // Delete a column
  const deleteColumn = async (columnId: string) => {
    if (["todo", "inprogress", "done"].includes(columnId)) {
      toast.error("Nie można usunąć domyślnej kolumny!");
      return;
    }

    // Get the column's database ID
    const columnDbId = columns[columnId]?.columnId;
    
    if (!columnDbId) {
      toast.error("Nie można usunąć kolumny - brak identyfikatora w bazie danych!");
      return;
    }

    try {
      // TODO: Dopisać notyfikację ale dopiero po usunięciu z bazy (status 200)
      // TODO: Napisać tak, jak na backendzie, że te taski przeskakują do kolumny poprzedniej (Na backendzie już tak jest)
      await api.delete(`columns/${columnDbId}`);
      
      // After successful deletion from database, update the UI
      const updatedColumns = { ...columns };
      delete updatedColumns[columnId];
      
      setColumns(updatedColumns);
      setColumnOrder((prev) => prev.filter((id) => id !== columnId));
      
      toast.success(`Usunięto kolumnę ${columns[columnId].title}`);
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Nie udało się usunąć kolumny. Spróbuj ponownie później.");
    }
  };

  // Check if a task can be added to a column based on WIP limit
  const canAddTaskToColumn = (columnId: string) => {
    const column = columns[columnId];
    if (!column) return false;

    if (column.wipLimit === 0) return true;

    return column.tasks.length < column.wipLimit;
  };

  // Add a task to a column
  const onAddTask = async (columnId: string, taskName: string) => {
    if (!canAddTaskToColumn(columnId)) {
      toast.error(`Kolumna ${columns[columnId].title} osiągnęła limit zadań!`);
      return;
    }

    const column = columns[columnId];

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
          priority: "normal",
          deadline: new Date(),
          users: [],
          dbId: response.data.data.id,
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

  // Update task position when dragged to another column - UPDATED FUNCTION
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
      console.error("Missing DB ID for task or column:", { taskId, dbId, destColumnId: destColumn.columnId });
      return;
    }

    try {
      // Update task's column in the database using the provided endpoint pattern
      await api.patch<ApiResponse<ITask>>(`tasks/${dbId}/change-column`, { 
        columnId: destColumn.columnId 
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
    deleteColumn,
    canAddTaskToColumn,
    onAddTask,
    onDeleteTask,
    checkWipLimitForMove,
    updateTaskPosition,
    initializeBoard,
    boardData,
    setBoardData,
  };
}