import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Column from "./Column";
import styles from "./KanbanBoard.module.scss";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useKanbanBoard } from "../../hooks/useKanbanBoard";
import ActionButton from "./KanbanBoardComponents/ActionButton";

function KanbanBoard() {
  useWebsiteTitle("Kanban Board");
  const {
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
    checkWipLimitForMove
  } = useKanbanBoard();

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    // Handle column reordering
    if (type === "COLUMN") {
      if (destination.index === source.index) return;
      const newColumnOrder = Array.from(columnOrder);
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedColumn);
      setColumnOrder(newColumnOrder);
      return;
    }

    // Handle task reordering
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // Check WIP limit for different column moves
    if (!checkWipLimitForMove(source.droppableId, destination.droppableId)) {
      return;
    }

    if (sourceColumn.id === destColumn.id) {
      // Moving within the same column
      const newTasks = Array.from(sourceColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      setColumns((prev) => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, tasks: newTasks },
      }));
    } else {
      // Moving to a different column
      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);

      setColumns((prev) => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, tasks: sourceTasks },
        [destColumn.id]: { ...destColumn, tasks: destTasks },
      }));
    }
  };

  return (
    <div className={styles.kanbanBoard}>
      <ToastContainer theme="dark" />
      <div className={styles.boardHeader}>
        <h1>Tablica Kanban</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div
              className={styles.boardContainer}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className={styles.boardColumns}>
                {columnOrder.map((columnId, index) => {
                  const column = columns[columnId];
                  if (!column) return null;

                  return (
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={index}
                    >
                      {(providedColumn) => (
                        <div
                          ref={providedColumn.innerRef}
                          {...providedColumn.draggableProps}
                          {...providedColumn.dragHandleProps}
                        >
                          <Column
                            col={column}
                            onAddTask={onAddTask}
                            onDeleteTask={onDeleteTask}
                            onDeleteColumn={() => deleteColumn(column.id)}
                            canDeleteColumn={
                              !["todo", "inprogress", "done"].includes(
                                column.id
                              )
                            }
                            updateWipLimit={updateColumnWipLimit}
                            canAddTask={canAddTaskToColumn(column.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                <div className={styles.addColumnSection}>
                  <div className={styles.columnCreation}>
                    <input
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Nazwa nowej kolumny"
                      className={styles.columnInput}
                    />
                    <ActionButton
                      onClick={addColumn}
                      variant="primary"
                      fullWidth
                      disabled={!newColumnTitle.trim()}
                    >
                      Dodaj kolumnę
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;