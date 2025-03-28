import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import styles from "./KanbanBoard.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useKanbanBoard } from "../../hooks/useKanbanBoard";
import Column from "../../components/Column/Column";
import ActionButton from "../../components/ActionButton/ActionButton";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { IKanban } from "../../interfaces/IKanban";
import { ITask } from "../../interfaces/ITask";

function KanbanBoard() {
  useWebsiteTitle("Kanban Board");
  const params = useParams();
  const api = useApiJson();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTableName, setNewTableName] = useState("");

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
    checkWipLimitForMove,
    updateTaskPosition,
    initializeBoard,
    boardData,
    setBoardData,
  } = useKanbanBoard();

  useEffect(() => {
    let isMounted = true;

    const fetchBoard = async () => {
      try {
        const res = await api.get<ApiResponse<IKanban>>(
          `kanban/board/${params.id}`
        );
        if (isMounted && res.data && res.data.data) {
          initializeBoard(res.data.data);
          setNewTableName(res.data.data.tableName);
        }
      } catch (error) {
        console.error("Error fetching board data:", error);
      }
    };

    fetchBoard();

    return () => {
      isMounted = false;
    };
  }, [params.id, initializeBoard]);

  const handleEditTableName = () => {
    setIsEditingTitle(true);
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setNewTableName(boardData?.tableName || "");
  };

  const handleSaveTableName = async () => {
    if (!newTableName.trim()) {
      toast.error("Nazwa tablicy nie może być pusta!");
      return;
    }

    try {
      const res = await api.patch<ApiResponse<IKanban>>(
        `kanban/change-table-name`,
        {
          id: params.id,
          tableName: newTableName.trim(),
        }
      );

      if (res.data && res.data.data) {
        // Update the board data with the new name
        setBoardData({
          ...boardData!,
          tableName: newTableName.trim(),
        });
        toast.success("Nazwa tablicy została zaktualizowana!");
      }

      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating table name:", error);
      toast.error("Nie udało się zaktualizować nazwy tablicy.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTableName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;

    // Handle column reordering
    if (type === "COLUMN") {
      if (destination.index === source.index) return;
      const newColumnOrder = Array.from(columnOrder);
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedColumn);
      setColumnOrder(newColumnOrder);

      // TOMEK [*] za to ale muszę XD
      const newColumnOrderWithNames = newColumnOrder.map((columnId) => {
        const column = columns[columnId];
        return column ? column.title : columnId;
      });

      // TODO: Dodać notyfikację odnośnie tego, że kolejność została zmieniona
      await api.patch(`columns/edit-order/${params.id}`, {
        columns: newColumnOrderWithNames,
      });
      return;
    }

    // Handle task reordering
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    console.log(sourceColumn, destColumn);

    // Check WIP limit for different column moves
    if (!checkWipLimitForMove(source.droppableId, destination.droppableId)) {
      return;
    }

    if (sourceColumn.id === destColumn.id) {
      // Moving within the same column
      const newTasks = Array.from(sourceColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      const tasksIds = newTasks.map((task) => task.dbId);

      api.patch("tasks/change-order", { tasksIds });

      setColumns((prev) => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, tasks: newTasks },
      }));
    } else {
      // Moving to a different column
      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);

      const [removed] = sourceTasks.splice(source.index, 1);

      console.log(removed.dbId);

      destTasks.splice(destination.index, 0, removed);

      setColumns((prev) => ({
        ...prev,
        [sourceColumn.id]: { ...sourceColumn, tasks: sourceTasks },
        [destColumn.id]: { ...destColumn, tasks: destTasks },
      }));

      api.patch<ApiResponse<ITask>>(`tasks/${removed.dbId}/change-column`, {
        columnId: destColumn.columnId,
      });

      // Update task position in the database when moved between columns
      const taskIdParts = draggableId.split("-");
      const actualTaskId = taskIdParts[1];
      updateTaskPosition(
        `task-${actualTaskId}`,
        source.droppableId,
        destination.droppableId
      );
    }
  };

  return (
    <div
      className={styles.kanbanBoard}
      style={{
        backgroundImage: `url(${boardData?.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",

      }}
    >
      <div className={styles.boardHeader}>
        {isEditingTitle ? (
          <div className={styles.editTitleContainer}>
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              className={styles.editTitleInput}
            />
            <div className={styles.editTitleActions}>
              <i
                className="bi bi-check-lg"
                onClick={handleSaveTableName}
                title="Zapisz"
              ></i>
              <i
                className="bi bi-x-lg"
                onClick={handleCancelEdit}
                title="Anuluj"
              ></i>
            </div>
          </div>
        ) : (
          <div className={styles.boardTitle}>
            <h1>{boardData?.tableName || "Tablica Kanban"}</h1>
            <i
              className="bi bi-pencil-square"
              onClick={handleEditTableName}
              title="Edytuj nazwę tablicy"
            ></i>
          </div>
        )}
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
                            onDeleteColumn={() =>
                              deleteColumn(column.id, column.columnId)
                            }
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
