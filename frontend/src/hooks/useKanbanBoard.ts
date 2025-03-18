import { useState,useCallback } from 'react';
import { toast } from 'react-toastify';
import { IKanban } from '../interfaces/IKanban';


interface ColumnState {
  [key: string]: {
    id: string;
    title: string;
    tasks: any[];
    wipLimit: number;
  };
}

export function useKanbanBoard() {
  const [columns, setColumns] = useState<ColumnState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [boardData, setBoardData] = useState<IKanban | null>(null);

  // Initialize board from API data
  const initializeBoard = useCallback((kanbanData: IKanban) => {
    setBoardData(kanbanData);
    
    const initialColumns: ColumnState = {};
    const initialColumnOrder: string[] = [];
    
    // Sort columns by order
    const sortedColumns = [...kanbanData.columns].sort((a, b) => a.order - b.order);
    
    sortedColumns.forEach((column) => {
      const columnId = column.name.toLowerCase().replace(/\s+/g, '');
      
      initialColumns[columnId] = {
        id: columnId,
        title: column.name,
        tasks: (column.tasks || []).map(task => ({
          id: `task-${task.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: task.name,
          name: task.name,
          description: task.description,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          users: task.users || []
        })),
        wipLimit: column.maxTasks || 0,
      };
      
      initialColumnOrder.push(columnId);
    });
    
    setColumns(initialColumns);
    setColumnOrder(initialColumnOrder);
  }, []);
  
  // Update WIP limit for a column
  const updateColumnWipLimit = (columnId: string, limit: number) => {
    if (limit < 0) {
      toast.error('Limit zadań nie może być ujemny!');
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
    toast.success(`Zmieniono limit zadań dla kolumny ${columns[columnId].title}`);
  };
  
  // Add a new column
  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    const columnId = newColumnTitle.toLowerCase().replace(/\s+/g, '');
    
    if (columns[columnId]) {
      toast.error('Kolumna o tej nazwie już istnieje!');
      return;
    }
    
    const newColumn = {
      id: columnId,
      title: newColumnTitle,
      tasks: [],
      wipLimit: 0,
    };
    
    setColumns((prev) => ({
      ...prev,
      [columnId]: newColumn,
    }));
    
    setColumnOrder((prev) => [...prev, columnId]);
    setNewColumnTitle('');
    
    toast.success(`Dodano kolumnę ${newColumnTitle}`);
    
    // Here you would also create this column on the backend
  };
  
  // Delete a column
  const deleteColumn = (columnId: string) => {
    if (["todo", "inprogress", "done"].includes(columnId)) {
      toast.error('Nie można usunąć domyślnej kolumny!');
      return;
    }
    
    const updatedColumns = { ...columns };
    delete updatedColumns[columnId];
    
    setColumns(updatedColumns);
    setColumnOrder((prev) => prev.filter((id) => id !== columnId));
    
    toast.success(`Usunięto kolumnę ${columns[columnId].title}`);
    
    // Here you would also delete this column on the backend
  };
  
  // Check if a task can be added to a column based on WIP limit
  const canAddTaskToColumn = (columnId: string) => {
    const column = columns[columnId];
    if (!column) return false;
    
    // If wipLimit is 0, there's no limit
    if (column.wipLimit === 0) return true;
    
    return column.tasks.length < column.wipLimit;
  };
  
  // Add a task to a column
  const onAddTask = (columnId: string, taskName: string) => {
    if (!canAddTaskToColumn(columnId)) {
      toast.error(`Kolumna ${columns[columnId].title} osiągnęła limit zadań!`);
      return;
    }
    
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: taskName,
      name: taskName,
      description: '',
      status: '',
      priority: 'normal',
      deadline: new Date(),
      users: []
    };
    
    setColumns((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: [...prev[columnId].tasks, newTask],
      },
    }));
    
    toast.success(`Dodano zadanie do kolumny ${columns[columnId].title}`);
    
    // Here you would also create this task on the backend
  };

  // Delete a task
  const onDeleteTask = (columnId: string, taskId: string) => {
    setColumns((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: prev[columnId].tasks.filter((task) => task.id !== taskId),
      },
    }));
    
    toast.success('Usunięto zadanie');
    
    // Here you would also delete this task on the backend
  };
  
  // Check if moving a task would violate WIP limits
  const checkWipLimitForMove = (sourceColumnId: string, destinationColumnId: string) => {
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
    updateColumnWipLimit,
    addColumn,
    deleteColumn,
    canAddTaskToColumn,
    onAddTask,
    onDeleteTask,
    checkWipLimitForMove,
    initializeBoard,
    boardData
  };
}