import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import styles from "./Column.module.scss";
import { useKanbanColumn } from "../../hooks/useKanbanColumn";
import ActionButton from "../ActionButton/ActionButton";
import TaskItem from "../TaskItem/TaskItem";
import WipLimitEditor from "../WipLimitEditor/WipLimitEditor";

interface ColumnProps {
  col: {
    id: string;
    title: string;
    tasks: any[];
    wipLimit: number;
  };
  onAddTask: (columnId: string, taskTitle: string) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onDeleteColumn: () => void;
  canDeleteColumn: boolean;
  updateWipLimit: (columnId: string, limit: number) => void;
  canAddTask: boolean;
}

const Column: React.FC<ColumnProps> = ({
  col,
  onAddTask,
  onDeleteTask,
  onDeleteColumn,
  canDeleteColumn,
  updateWipLimit,
  canAddTask,
}) => {
  const {
    isAddingTask,
    setIsAddingTask,
    newTaskTitle,
    setNewTaskTitle,
    isEditingWipLimit,
    setIsEditingWipLimit,
    handleAddTask,
    handleWipLimitSave,
    isLimitReached,
  } = useKanbanColumn({
    column: col,
    onAddTask,
    updateWipLimit,
  });

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h3>{col.title}</h3>
        <div className={styles.columnHeaderActions}>
          <span className={`badge ${styles.taskCount}`}>
            {col.tasks.length}
            {col.wipLimit > 0 && `/${col.wipLimit}`}
          </span>
          {canDeleteColumn && (
            <button
              onClick={onDeleteColumn}
              className={styles.deleteColumnButton}
              title="Usuń kolumnę"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>
      </div>

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

      <div className={styles.columnActions}>
        <ActionButton
          onClick={() => setIsAddingTask(!isAddingTask)}
          disabled={!canAddTask}
          variant="primary"
          fullWidth
        >
          Dodaj zadanie
        </ActionButton>
      </div>

      {isAddingTask && (
        <div className={styles.inlineTaskInput}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Wpisz tytuł zadania"
            className={`form-control ${styles.taskInput}`}
          />
          <div className={styles.confirmTaskActions}>
            <ActionButton
              onClick={handleAddTask}
              variant="success"
              disabled={!newTaskTitle.trim()}
            >
              Dodaj
            </ActionButton>
            <ActionButton
              onClick={() => setIsAddingTask(false)}
              variant="default"
            >
              Anuluj
            </ActionButton>
          </div>
        </div>
      )}

      <Droppable droppableId={col.id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={styles.columnContent}
          >
            {col.tasks.map((task, index) => (
              <TaskItem
                key={`${col.id}-${task.id}-${index}`}
                task={task}
                index={index}
                columnId={col.id}
                onDeleteTask={() => onDeleteTask(col.id, task.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
