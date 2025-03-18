import { useState } from 'react';

interface UseKanbanColumnProps {
  column: {
    id: string;
    title: string;
    tasks: any[];
    wipLimit: number;
  };
  onAddTask: (columnId: string, taskTitle: string) => void;
  updateWipLimit: (columnId: string, limit: number) => void;
}

export function useKanbanColumn({
  column,
  onAddTask,
  updateWipLimit,
}: UseKanbanColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditingWipLimit, setIsEditingWipLimit] = useState(false);
  
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    onAddTask(column.id, newTaskTitle);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };
  
  const handleWipLimitSave = (newLimit: number) => {
    updateWipLimit(column.id, newLimit);
    setIsEditingWipLimit(false);
  };
  
  const isLimitReached = column.wipLimit > 0 && column.tasks.length >= column.wipLimit;
  
  return {
    isAddingTask,
    setIsAddingTask,
    newTaskTitle,
    setNewTaskTitle,
    isEditingWipLimit,
    setIsEditingWipLimit,
    handleAddTask,
    handleWipLimitSave,
    isLimitReached,
  };
}