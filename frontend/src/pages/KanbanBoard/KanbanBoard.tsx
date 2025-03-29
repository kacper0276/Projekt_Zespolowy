import {
  DragDropContext,
  DropResult,
} from "@hello-pangea/dnd";
import styles from "./KanbanBoard.module.scss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useKanbanBoard } from "../../hooks/useKanbanBoard";
import ActionButton from "../../components/ActionButton/ActionButton";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApiJson } from "../../config/api";
import { IUser } from "../../interfaces/IUser";
import BoardHeader from "../../components/BoardHeader/BoardHeader";
import ColumnHeader from "../../components/ColumnHeader/ColumnHeader";
import KanbanGrid from "../../components/KanbanGrid/KanbanGrid";
import { IColumnEntity } from "../../interfaces/IColumnEntity";
import { IKanban } from "../../interfaces/IKanban";
import { ApiResponse } from "../../types/api.types";

function KanbanBoard() {
  useWebsiteTitle("Kanban Board");
  const params = useParams<{ id: string }>(); 
  const api = useApiJson();
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
    onAddTask,
    onDeleteTask,
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
      const newColumnOrderWithNames = newColumnOrder.map((columnId) => {
        const column = columns[columnId];
        return column ? column.title : columnId;
      });
    
      // Aktualizacja kolejności w bazie danych
      await api.patch(`columns/edit-order/${params.id}`, {
        columns: newColumnOrderWithNames,
      });
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

  const onDeleteTaskFromCell = (rowId: string, colId: string, taskId: string) => {
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

  // Create a compatible header data object that satisfies BoardHeader requirements
  const headerBoardData: { tableName: string } = {
    tableName: boardData?.tableName || ""
  };

  // Create a modified setBoardData function that matches the expected signature
  const handleSetBoardData = (data: { tableName: string }) => {
    // Update the original boardData with the new tableName
    if (boardData) {
      setBoardData({
        ...boardData,
        tableName: data.tableName
      });
    } else {
      // If boardData is null, create a minimal valid object
      setBoardData({
        tableName: data.tableName,
        columns: [] as IColumnEntity[], // This is the fix for the type error
        statuses: [],
        backgroundImage: ""
      } as IKanban);
    }
  };

  return (
    <div className={styles.kanbanBoard}>
      <ToastContainer theme="dark" />
      <BoardHeader 
        boardData={headerBoardData}
        setBoardData={handleSetBoardData}
        api={api} 
        params={{ id: params.id || "" }}
      />

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
          <ColumnHeader 
            columns={columns}
            columnOrder={columnOrder}
            countTasksInColumn={countTasksInColumn}
            isEditingWipLimitMap={isEditingWipLimitMap}
            handleWipLimitSave={handleWipLimitSave}
            handleStartEditingWipLimit={handleStartEditingWipLimit}
            handleCancelEditingWipLimit={handleCancelEditingWipLimit}
            deleteColumn={deleteColumn}
            newColumnTitle={newColumnTitle}
            setNewColumnTitle={setNewColumnTitle}
            addColumn={addColumn}
          />
          
          <KanbanGrid 
            rows={rows}
            columnOrder={columnOrder}
            columns={columns}
            taskGrid={taskGrid}
            isAddingTaskMap={isAddingTaskMap}
            newTaskTitleMap={newTaskTitleMap}
            countTasksInColumn={countTasksInColumn}
            handleDeleteRow={handleDeleteRow}
            handleStartAddingTask={handleStartAddingTask}
            handleTaskTitleChange={handleTaskTitleChange}
            handleAddTaskSubmit={handleAddTaskSubmit}
            handleCancelAddingTask={handleCancelAddingTask}
            onDeleteTaskFromCell={onDeleteTaskFromCell}
            handleTaskUpdate={handleTaskUpdate}
          />
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;