import { useState } from "react";
import { useApiJson } from "../config/api";

interface UseKanbanColumnProps {
  column: {
    id: string;
    title: string;
    tasks: any[];
    wipLimit: number;
    columnId?: number;
  };
  onAddTask: (columnId: string, taskTitle: string) => void;
  updateWipLimit: (columnId: string, limit: number) => void;
}

export function useKanbanColumn({
  column,
  onAddTask,
  updateWipLimit,
}: UseKanbanColumnProps) {
  const api = useApiJson();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditingWipLimit, setIsEditingWipLimit] = useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    onAddTask(column.id, newTaskTitle);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleWipLimitSave = (newLimit: number) => {
    updateWipLimit(column.id, newLimit);

    // TODO: Dodać notyfikację że zmieniono limit
    api.patch(`columns/edit-wip-limit/${column.columnId}`, { newLimit });

    setIsEditingWipLimit(false);
  };

  const isLimitReached =
    column.wipLimit > 0 && column.tasks.length >= column.wipLimit;

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
