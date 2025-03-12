import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ColumnsState, ColumnData } from '../types/kanban.types';
import { ApiResponse } from '../types/api.types';
import { UserType } from '../interfaces/IUser';
import { useApiJson } from '../config/api';

export const useKanbanBoard = () => {
  const api = useApiJson();
  const [newColumnTitle, setNewColumnTitle] = useState<string>('');
  const [columns, setColumns] = useState<ColumnsState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  // Initialize with default columns
  useEffect(() => {
    if (Object.keys(columns).length === 0) {
      const initialColumns: ColumnsState = {
        todo: {
          id: 'todo',
          title: 'To Do',
          tasks: [],
          uniqueCounter: 0,
          wipLimit: 0, // 0 means no limit
        },
        inprogress: {
          id: 'inprogress',
          title: 'In Progress',
          tasks: [],
          uniqueCounter: 0,
          wipLimit: 5, // Default WIP limit for In Progress
        },
        done: {
          id: 'done',
          title: 'Done',
          tasks: [],
          uniqueCounter: 0,
          wipLimit: 0, // No limit
        },
      };
      setColumns(initialColumns);
      setColumnOrder(['todo', 'inprogress', 'done']);

      api.get<ApiResponse<UserType[]>>('users/all').then((response) => {
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
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

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
      setNewColumnTitle('');
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
          position: 'top-center',
          autoClose: 3000,
        }
      );
      return;
    }

    setColumns((prev) => {
      const column = prev[columnId];
      const newTask = {
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

  const checkWipLimitForMove = (sourceColumnId: string, destColumnId: string) => {
    const destColumn = columns[destColumnId];
    if (
      sourceColumnId !== destColumnId &&
      destColumn.wipLimit > 0 &&
      destColumn.tasks.length >= destColumn.wipLimit
    ) {
      toast.error(
        `Nie można przenieść zadania do kolumny "${destColumn.title}" - osiągnięto limit WIP (${destColumn.wipLimit})`,
        {
          position: 'top-center',
          autoClose: 3000,
        }
      );
      return false;
    }
    return true;
  };

  return {
    columns,
    setColumns,
    columnOrder,
    setColumnOrder,
    users,
    newColumnTitle,
    setNewColumnTitle,
    updateColumnWipLimit,
    addColumn,
    deleteColumn,
    canAddTaskToColumn,
    onAddTask,
    onDeleteTask,
    checkWipLimitForMove
  };
};