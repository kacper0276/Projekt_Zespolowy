import React, { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "./Column.module.scss";
import { useKanbanColumn } from "../../hooks/useKanbanColumn";
import ActionButton from "../ActionButton/ActionButton";
import WipLimitEditor from "../WipLimitEditor/WipLimitEditor";

interface ColumnProps {
  col: {
    id: string;
    title: string;
    tasks: any[];
    wipLimit: number;
  };
  rowId: string;
  cellTasks: any[];
  isAddingTask: boolean;
  newTaskTitle: string;
  onAddTask: (columnId: string, taskTitle: string) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onDeleteColumn: () => void;
  canDeleteColumn: boolean;
  updateWipLimit: (columnId: string, limit: number) => void;
  canAddTask: boolean;
  onStartAddingTask: () => void;
  onCancelAddingTask: () => void;
  onTaskTitleChange: (value: string) => void;
  onAddTaskSubmit: () => void;
}

const Column: React.FC<ColumnProps> = ({
  col,
  rowId,
  cellTasks,
  isAddingTask,
  newTaskTitle,
  onAddTask,
  onDeleteTask,
  onDeleteColumn,
  canDeleteColumn,
  updateWipLimit,
  canAddTask,
  onStartAddingTask,
  onCancelAddingTask,
  onTaskTitleChange,
  onAddTaskSubmit
}) => {
  const {
    isEditingWipLimit,
    setIsEditingWipLimit,
    handleWipLimitSave,
    isLimitReached,
  } = useKanbanColumn({
    column: col,
    onAddTask,
    updateWipLimit,
  });

  return (
    <div className={styles.cell}>
      <Droppable droppableId={`${rowId}-${col.id}`}>
        {(provided) => (
          <div
            className={styles.cellContent}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {cellTasks.map((task, index) => (
              <Draggable
                key={`${rowId}-${col.id}-${task.id}-${index}`}
                draggableId={`${rowId}-${col.id}-${task.id}-${index}`}
                index={index}
              >
                {(providedTask) => (
                  <div
                    ref={providedTask.innerRef}
                    {...providedTask.draggableProps}
                    {...providedTask.dragHandleProps}
                    className={styles.task}
                  >
                    <div className={styles.taskContent}>
                      <span className={styles.taskText}>
                        {task.name || task.content}
                      </span>
                      <button
                        onClick={() => onDeleteTask(col.id, task.id)}
                        className={styles.deleteTaskButton}
                        title="Usuń zadanie"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className={styles.cellActions}>
        {isAddingTask ? (
          <div className={styles.inlineTaskInput}>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => onTaskTitleChange(e.target.value)}
              placeholder="Wpisz tytuł zadania"
              className={styles.taskInput}
              autoFocus
            />
            <div className={styles.confirmTaskActions}>
              <ActionButton
                onClick={onAddTaskSubmit}
                variant="success"
                disabled={!newTaskTitle.trim()}
              >
                Dodaj
              </ActionButton>
              <ActionButton
                onClick={onCancelAddingTask}
                variant="default"
              >
                Anuluj
              </ActionButton>
            </div>
          </div>
        ) : (
          <ActionButton
            onClick={onStartAddingTask}
            variant="primary"
            fullWidth
            disabled={!canAddTask}
          >
            Dodaj zadanie
          </ActionButton>
        )}
      </div>

      {/* WIP Limit editor (optional) */}
      <div className={styles.wipLimitSection}>
        {isEditingWipLimit ? (
          <WipLimitEditor
            currentLimit={col.wipLimit}
            onSave={handleWipLimitSave}
            onCancel={() => setIsEditingWipLimit(false)}
          />
        ) : (
          <div
            className={`${styles.wipLimitDisplay} ${
              isLimitReached ? styles.limitReached : ""
            }`}
            onClick={() => setIsEditingWipLimit(true)}
            title="Kliknij, aby edytować limit zadań"
          >
            <span>WIP Limit: {col.wipLimit === 0 ? "Brak" : col.wipLimit}</span>
            <i className="bi bi-pencil-fill ms-2"></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;