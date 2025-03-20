import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import styles from "./KanbanBoard.module.scss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useKanbanBoard } from "../../hooks/useKanbanBoard";
import Column from "../../components/Column/Column";
import TaskItem from "../../components/TaskItem/TaskItem";
import ActionButton from "../../components/ActionButton/ActionButton";
import WipLimitEditor from "../../components/WipLimitEditor/WipLimitEditor";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { IKanban } from "../../interfaces/IKanban";
import { IUser } from "../../interfaces/IUser";

function KanbanBoard() {
  useWebsiteTitle("Kanban Board");
  const params = useParams();
  const api = useApiJson();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [rows, setRows] = useState<string[]>([
    "Default",
    "High Priority",
    "Low Priority",
  ]);
  const [newRowName, setNewRowName] = useState("");
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [isAddingTaskMap, setIsAddingTaskMap] = useState<{
    [key: string]: boolean;
  }>({});
  const [newTaskTitleMap, setNewTaskTitleMap] = useState<{
    [key: string]: string;
  }>({});
  // Dodajemy stan dla edycji limitów WIP
  const [isEditingWipLimitMap, setIsEditingWipLimitMap] = useState<{
    [columnId: string]: boolean;
  }>({});

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

  // Create a grid structure for tasks
  const [taskGrid, setTaskGrid] = useState<{
    [rowId: string]: { [colId: string]: any[] };
  }>(
    rows.reduce(
      (acc, row) => ({
        ...acc,
        [row]: Object.keys(columns).reduce(
          (colAcc, colId) => ({
            ...colAcc,
            [colId]: [],
          }),
          {}
        ),
      }),
      {}
    )
  );

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

          // After initializing board, distribute tasks to the first row
          const newTaskGrid = { ...taskGrid };
          if (!newTaskGrid["Default"]) {
            newTaskGrid["Default"] = {};
          }

          Object.keys(columns).forEach((colId) => {
            if (!newTaskGrid["Default"][colId]) {
              newTaskGrid["Default"][colId] = [];
            }
            // Make a deep copy of tasks to avoid reference issues
            newTaskGrid["Default"][colId] = columns[colId].tasks.map(task => ({...task}));
          });

          setTaskGrid(newTaskGrid);
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

  // Update task grid when columns change, but avoid resetting tasks that were moved
  useEffect(() => {
    const newTaskGrid = { ...taskGrid };

    // Make sure all rows have entries for all columns
    rows.forEach((row) => {
      if (!newTaskGrid[row]) {
        newTaskGrid[row] = {};
      }

      Object.keys(columns).forEach((colId) => {
        if (!newTaskGrid[row][colId]) {
          newTaskGrid[row][colId] = [];
        }
      });
    });

    // Only initialize Default row with tasks if it's empty
    if (newTaskGrid["Default"]) {
      Object.keys(columns).forEach((colId) => {
        // Only fill empty columns, don't reset existing ones
        if (!newTaskGrid["Default"][colId] || newTaskGrid["Default"][colId].length === 0) {
          // Make a deep copy of tasks to avoid reference issues
          newTaskGrid["Default"][colId] = columns[colId].tasks.map(task => ({...task}));
        }
      });
    }

    setTaskGrid(newTaskGrid);
  }, [columnOrder]); // Only react to column order changes, not to all column changes

  const handleEditTableName = () => {
    setIsEditingTitle(true);
  };

  const handleStartAddingTask = (rowId: string, colId: string) => {
    setIsAddingTaskMap((prev) => ({
      ...prev,
      [`${rowId}-${colId}`]: true,
    }));
    setNewTaskTitleMap((prev) => ({
      ...prev,
      [`${rowId}-${colId}`]: "",
    }));
  };

  const handleCancelAddingTask = (rowId: string, colId: string) => {
    setIsAddingTaskMap((prev) => ({
      ...prev,
      [`${rowId}-${colId}`]: false,
    }));
  };

  const handleTaskTitleChange = (
    rowId: string,
    colId: string,
    value: string
  ) => {
    setNewTaskTitleMap((prev) => ({
      ...prev,
      [`${rowId}-${colId}`]: value,
    }));
  };

  const handleAddTaskSubmit = (rowId: string, colId: string) => {
    const taskTitle = newTaskTitleMap[`${rowId}-${colId}`] || "";
    if (taskTitle.trim()) {
      onAddTaskToCell(rowId, colId, taskTitle);
      // Reset the input state
      handleCancelAddingTask(rowId, colId);
    }
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

  const handleAddRow = () => {
    if (!newRowName.trim()) {
      toast.error("Nazwa wiersza nie może być pusta!");
      return;
    }

    const newRows = [...rows, newRowName.trim()];
    setRows(newRows);

    // Add new row to taskGrid
    const newTaskGrid = { ...taskGrid };
    newTaskGrid[newRowName.trim()] = {};

    // Initialize empty task arrays for all columns
    Object.keys(columns).forEach((colId) => {
      newTaskGrid[newRowName.trim()][colId] = [];
    });

    setTaskGrid(newTaskGrid);
    setNewRowName("");
    setIsAddingRow(false);
    toast.success("Wiersz został dodany!");
  };

  const handleDeleteRow = (rowName: string) => {
    // Don't delete the default row
    if (rowName === "Default") {
      toast.error("Nie można usunąć domyślnego wiersza!");
      return;
    }

    const newRows = rows.filter((r) => r !== rowName);
    setRows(newRows);

    // Remove row from taskGrid and move tasks to Default row
    const newTaskGrid = { ...taskGrid };

    // Before deleting, move any tasks to the Default row
    if (newTaskGrid[rowName]) {
      Object.keys(newTaskGrid[rowName]).forEach((colId) => {
        newTaskGrid["Default"][colId] = [
          ...newTaskGrid["Default"][colId],
          ...newTaskGrid[rowName][colId],
        ];
      });
    }

    delete newTaskGrid[rowName];
    setTaskGrid(newTaskGrid);

    toast.success("Wiersz został usunięty!");
  };

  // Zaimplementowane funkcje do obsługi WIP limitów
  const handleStartEditingWipLimit = (columnId: string) => {
    setIsEditingWipLimitMap((prev) => ({
      ...prev,
      [columnId]: true,
    }));
  };

  const handleCancelEditingWipLimit = (columnId: string) => {
    setIsEditingWipLimitMap((prev) => ({
      ...prev,
      [columnId]: false,
    }));
  };

  const handleWipLimitSave = (columnId: string, limit: number) => {
    updateColumnWipLimit(columnId, limit);
    handleCancelEditingWipLimit(columnId);
    toast.success(`Limit zadań dla kolumny został zaktualizowany na ${limit === 0 ? "brak limitu" : limit}!`);
  };

  const isLimitReached = (columnId: string): boolean => {
    const column = columns[columnId];
    if (!column || column.wipLimit === 0) return false;
    
    // Calculate total tasks in the column across all rows
    let totalTasks = 0;
    rows.forEach(rowId => {
      if (taskGrid[rowId] && taskGrid[rowId][columnId]) {
        totalTasks += taskGrid[rowId][columnId].length;
      }
    });
    
    return totalTasks >= column.wipLimit;
  };

  // Helper function to count tasks in a column across all rows
  const countTasksInColumn = (columnId: string): number => {
    let count = 0;
    rows.forEach(rowId => {
      if (taskGrid[rowId] && taskGrid[rowId][columnId]) {
        count += taskGrid[rowId][columnId].length;
      }
    });
    return count;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
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

    // Parse the droppable ID to get row and column
    const sourceRowId = source.droppableId.split("-")[0];
    const sourceColId = source.droppableId.split("-")[1];
    const destRowId = destination.droppableId.split("-")[0];
    const destColId = destination.droppableId.split("-")[1];

    // Check if we're moving to a different column
    if (sourceColId !== destColId) {
      // Count current tasks in destination column
      const destColumnTaskCount = countTasksInColumn(destColId);
      
      // Get destination column's WIP limit
      const destColumn = columns[destColId];
      if (destColumn && destColumn.wipLimit > 0 && destColumnTaskCount >= destColumn.wipLimit) {
        toast.error(`Nie można dodać więcej zadań do kolumny ${destColumn.title} - limit WIP osiągnięty!`);
        return;
      }
    }

    // Create a new task grid
    const newTaskGrid = { ...taskGrid };

    // Moving task within the same cell
    if (sourceRowId === destRowId && sourceColId === destColId) {
      const tasks = Array.from(newTaskGrid[sourceRowId][sourceColId]);
      const [removed] = tasks.splice(source.index, 1);
      tasks.splice(destination.index, 0, removed);
      newTaskGrid[sourceRowId][sourceColId] = tasks;
    } else {
      // Moving to a different cell
      const sourceTasks = Array.from(newTaskGrid[sourceRowId][sourceColId]);
      const [removed] = sourceTasks.splice(source.index, 1);

      // Ensure destination exists
      if (!newTaskGrid[destRowId]) {
        newTaskGrid[destRowId] = {};
      }
      if (!newTaskGrid[destRowId][destColId]) {
        newTaskGrid[destRowId][destColId] = [];
      }

      const destTasks = Array.from(newTaskGrid[destRowId][destColId]);
      destTasks.splice(destination.index, 0, removed);

      newTaskGrid[sourceRowId][sourceColId] = sourceTasks;
      newTaskGrid[destRowId][destColId] = destTasks;

      // Only update position in database if column changed
      if (sourceColId !== destColId) {
        const taskIdParts = draggableId.split("-");
        const actualTaskId = taskIdParts[1];
        updateTaskPosition(`task-${actualTaskId}`, sourceColId, destColId);

        // Update columns for the database
        const updatedColumns = { ...columns };
        
        // Find the task in the source column
        let movedTask = null;
        for (const row of rows) {
          if (taskGrid[row] && taskGrid[row][sourceColId]) {
            movedTask = taskGrid[row][sourceColId].find(t => t.id === draggableId);
            if (movedTask) break;
          }
        }
        
        if (movedTask) {
          // Update tasks in each column - important for WIP limit calculations
          updatedColumns[sourceColId] = {
            ...updatedColumns[sourceColId],
            tasks: updatedColumns[sourceColId].tasks.filter(t => t.id !== draggableId),
          };
          
          updatedColumns[destColId] = {
            ...updatedColumns[destColId],
            tasks: [...updatedColumns[destColId].tasks, movedTask],
          };
          
          setColumns(updatedColumns);
        }
      }
    }

    setTaskGrid(newTaskGrid);
  };

  const onAddTaskToCell = (rowId: string, colId: string, taskTitle: string) => {
    // Get current task count in the column to check WIP limit
    const currentTaskCount = countTasksInColumn(colId);
    const column = columns[colId];
    
    // Check if adding a task would exceed the WIP limit
    if (column && column.wipLimit > 0 && currentTaskCount >= column.wipLimit) {
      toast.error(`Nie można dodać więcej zadań do kolumny ${column.title} - limit WIP osiągnięty!`);
      return;
    }

    // Only add task if title is not empty
    if (!taskTitle.trim()) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      content: taskTitle,
      name: taskTitle,
      users: [], // Dodajemy pustą tablicę użytkowników
    };

    // Add task to the column for database
    onAddTask(colId, taskTitle);

    // Add task to the specific cell in the grid
    const newTaskGrid = { ...taskGrid };
    if (!newTaskGrid[rowId]) {
      newTaskGrid[rowId] = {};
    }
    if (!newTaskGrid[rowId][colId]) {
      newTaskGrid[rowId][colId] = [];
    }

    newTaskGrid[rowId][colId] = [...newTaskGrid[rowId][colId], newTask];
    setTaskGrid(newTaskGrid);
  };

  const onDeleteTaskFromCell = (
    rowId: string,
    colId: string,
    taskId: string
  ) => {
    // Remove task from the specific cell
    const newTaskGrid = { ...taskGrid };
    if (newTaskGrid[rowId] && newTaskGrid[rowId][colId]) {
      newTaskGrid[rowId][colId] = newTaskGrid[rowId][colId].filter(
        (task) => task.id !== taskId
      );
    }

    // Remove task from the column for database
    onDeleteTask(colId, taskId);

    setTaskGrid(newTaskGrid);
  };

  // Funkcja do aktualizacji danych zadania (nazwa i przypisani użytkownicy)
  const handleTaskUpdate = (rowId: string, colId: string, taskId: string, updatedData: { name: string; users: IUser[] }) => {
    // Aktualizuj dane w taskGrid
    const newTaskGrid = { ...taskGrid };
    
    if (newTaskGrid[rowId] && newTaskGrid[rowId][colId]) {
      const taskIndex = newTaskGrid[rowId][colId].findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        newTaskGrid[rowId][colId][taskIndex] = {
          ...newTaskGrid[rowId][colId][taskIndex],
          content: updatedData.name,
          name: updatedData.name,
          users: updatedData.users,
        };
      }
    }
    
    setTaskGrid(newTaskGrid);
    
    // Aktualizacja w bazie danych
    const actualTaskId = taskId.split("-")[1];
    api.patch(`tasks/${actualTaskId}/assign-users`, { users: updatedData.users })
      .then(() => {
        toast.success("Zadanie zostało zaktualizowane!");
      })
      .catch((error) => {
        console.error("Error updating task:", error);
        toast.error("Nie udało się zaktualizować zadania.");
      });
  };

  return (
    <div className={styles.kanbanBoard}>
      <ToastContainer theme="dark" />
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

      <div className={styles.boardControls}>
        <div className={styles.rowControls}>
          {isAddingRow ? (
            <div className={styles.addRowForm}>
              <input
                type="text"
                value={newRowName}
                onChange={(e) => setNewRowName(e.target.value)}
                placeholder="Nazwa nowego wiersza"
                className={styles.rowInput}
              />
              <div className={styles.rowActions}>
                <ActionButton
                  onClick={handleAddRow}
                  variant="success"
                  disabled={!newRowName.trim()}
                >
                  Dodaj
                </ActionButton>
                <ActionButton
                  onClick={() => setIsAddingRow(false)}
                  variant="default"
                >
                  Anuluj
                </ActionButton>
              </div>
            </div>
          ) : (
            <ActionButton
              onClick={() => setIsAddingRow(true)}
              variant="primary"
            >
              Dodaj nowy wiersz
            </ActionButton>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.gridContainer}>
          {/* Fixed header row with column titles */}
          <div className={styles.headerRow}>
            <div className={styles.rowLabel}>Wiersze / Kolumny</div>
            <Droppable
              droppableId="columnHeaders"
              type="COLUMN"
              direction="horizontal"
            >
              {(provided) => (
                <div
                  className={styles.columnHeaders}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {columnOrder.map((columnId, index) => {
                    const column = columns[columnId];
                    if (!column) return null;

                    // Count total tasks in this column across all rows
                    const totalTasksInColumn = countTasksInColumn(columnId);

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
                            className={styles.columnHeader}
                          >
                            <h3>{column.title}</h3>
                            <div className={styles.columnHeaderActions}>
                              <span className={`badge ${styles.taskCount} ${
                                column.wipLimit > 0 && totalTasksInColumn >= column.wipLimit 
                                  ? styles.limitReached 
                                  : ""
                              }`}>
                                {totalTasksInColumn}
                                {column.wipLimit > 0 && `/${column.wipLimit}`}
                              </span>
                              
                              {/* Dodajemy edytor limitów WIP */}
                              <div className={styles.wipLimitSection}>
                                {isEditingWipLimitMap[column.id] ? (
                                  <WipLimitEditor
                                    currentLimit={column.wipLimit}
                                    onSave={(limit) => handleWipLimitSave(column.id, limit)}
                                    onCancel={() => handleCancelEditingWipLimit(column.id)}
                                  />
                                ) : (
                                  <div
                                    className={`${styles.wipLimitDisplay} ${
                                      column.wipLimit > 0 && totalTasksInColumn >= column.wipLimit 
                                        ? styles.limitReached 
                                        : ""
                                    }`}
                                    onClick={() => handleStartEditingWipLimit(column.id)}
                                    title="Kliknij, aby edytować limit zadań"
                                  >
                                    <span>WIP: {column.wipLimit === 0 ? "Brak" : column.wipLimit}</span>
                                    <i className="bi bi-pencil-fill ms-2"></i>
                                  </div>
                                )}
                              </div>
                              
                              {!["todo", "inprogress", "done"].includes(
                                column.id
                              ) && (
                                <button
                                  onClick={() => deleteColumn(column.id)}
                                  className={styles.deleteColumnButton}
                                  title="Usuń kolumnę"
                                >
                                  <i className="bi bi-x-circle-fill"></i>
                                </button>
                              )}
                            </div>
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
              )}
            </Droppable>
          </div>

          {/* Grid rows */}
          <div className={styles.gridRows}>
            {rows.map((rowId) => (
              <div key={rowId} className={styles.gridRow}>
                <div className={styles.rowLabel}>
                  {rowId}
                  {rowId !== "Default" && (
                    <button
                      onClick={() => handleDeleteRow(rowId)}
                      className={styles.deleteRowButton}
                      title="Usuń wiersz"
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  )}
                </div>

                <div className={styles.rowCells}>
                  {columnOrder.map((columnId) => {
                    const column = columns[columnId];
                    if (!column) return null;

                    // Ensure the cell exists in the taskGrid
                    if (!taskGrid[rowId]) {
                      taskGrid[rowId] = {};
                    }
                    if (!taskGrid[rowId][columnId]) {
                      taskGrid[rowId][columnId] = [];
                    }

                    const isAddingTaskToThisCell = !!isAddingTaskMap[`${rowId}-${columnId}`];
                    const newTaskTitleForCell = newTaskTitleMap[`${rowId}-${columnId}`] || "";
                    const columnHasSpace = column.wipLimit === 0 || countTasksInColumn(columnId) < column.wipLimit;

                    return (
                      <div key={`${rowId}-${columnId}`} className={styles.gridCell}>
                        <Droppable droppableId={`${rowId}-${columnId}`}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`${styles.cellContent} ${
                                snapshot.isDraggingOver ? styles.draggingOver : ""
                              } ${
                                column.wipLimit > 0 && countTasksInColumn(columnId) >= column.wipLimit 
                                  ? styles.limitReached 
                                  : ""
                              }`}
                            >
                              {taskGrid[rowId][columnId].map((task, index) => (
                                <TaskItem
                                  key={task.id}
                                  task={task}
                                  index={index}
                                  columnId={columnId}
                                  onDeleteTask={() => onDeleteTaskFromCell(rowId, columnId, task.id)}
                                  onTaskUpdate={(updatedData) => handleTaskUpdate(rowId, columnId, task.id, updatedData)}
                                />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {isAddingTaskToThisCell ? (
                          <div className={styles.addTaskForm}>
                            <input
                              type="text"
                              value={newTaskTitleForCell}
                              onChange={(e) => handleTaskTitleChange(rowId, columnId, e.target.value)}
                              placeholder="Nazwa zadania"
                              className={styles.taskInput}
                              autoFocus
                            />
                            <div className={styles.addTaskActions}>
                              <ActionButton
                                onClick={() => handleAddTaskSubmit(rowId, columnId)}
                                variant="success"
                                disabled={!newTaskTitleForCell.trim()}
                              >
                                Dodaj
                              </ActionButton>
                              <ActionButton
                                onClick={() => handleCancelAddingTask(rowId, columnId)}
                                variant="default"
                              >
                                Anuluj
                              </ActionButton>
                            </div>
                          </div>
                        ) : (
                          columnHasSpace && (
                            <button
                              onClick={() => handleStartAddingTask(rowId, columnId)}
                              className={styles.addTaskButton}
                            >
                              <i className="bi bi-plus-circle"></i> Dodaj zadanie
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;