import { useState } from 'react';
import { toast } from 'react-toastify';
import { ColumnData } from '../types/kanban.types';
interface UseKanbanColumnProps {
  column: ColumnData;
  onAddTask: (columnId: string, taskTitle: string) => void;
  updateWipLimit: (columnId: string, limit: number) => void;
}
export const useKanbanColumn = ({ column, onAddTask, updateWipLimit }: UseKanbanColumnProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditingWipLimit, setIsEditingWipLimit] = useState(false);
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };
  const handleWipLimitSave = (newLimit: number) => {
    if (isNaN(newLimit) || newLimit < 0) {
      toast.error('Limit WIP musi być liczbą większą lub równą 0', {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }
   
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
    isLimitReached
  };
};