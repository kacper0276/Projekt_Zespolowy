import { DragDropContext, DropResult } from "@hello-pangea/dnd";
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
import { ApiResponse } from "../../types/api.types";
import { IKanban } from "../../interfaces/IKanban";

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
  // Stan dla edycji limitów WIP
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

  // Utworzenie struktury siatki dla zadań
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
          // Po inicjalizacji tablicy, rozdziel zadania do pierwszego wiersza
          const newTaskGrid = { ...taskGrid };
          if (!newTaskGrid["Default"]) {
            newTaskGrid["Default"] = {};
          }

          Object.keys(columns).forEach((colId) => {
            if (!newTaskGrid["Default"][colId]) {
              newTaskGrid["Default"][colId] = [];
            }
            // Głęboka kopia zadań, aby uniknąć problemów z referencjami
            newTaskGrid["Default"][colId] = columns[colId].tasks.map(
              (task) => ({ ...task })
            );
          });

          setTaskGrid(newTaskGrid);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych tablicy:", error);
      }
    };

    fetchBoard();

    return () => {
      isMounted = false;
    };
  }, [params.id, initializeBoard]);

  // Aktualizacja siatki zadań po zmianie kolumn, ale bez resetowania przesuniętych zadań
  useEffect(() => {
    const newTaskGrid = { ...taskGrid };

    // Upewnij się, że wszystkie wiersze mają wpisy dla wszystkich kolumn
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

    // Tylko inicjalizuj wiersz Default zadaniami, jeśli jest pusty
    if (newTaskGrid["Default"]) {
      Object.keys(columns).forEach((colId) => {
        if (
          !newTaskGrid["Default"][colId] ||
          newTaskGrid["Default"][colId].length === 0
        ) {
          // Głęboka kopia zadań
          newTaskGrid["Default"][colId] = columns[colId].tasks.map((task) => ({
            ...task,
          }));
        }
      });
    }

    setTaskGrid(newTaskGrid);
  }, [columnOrder]);

  // Function to update taskGrid when a column is deleted
  const handleColumnDeleted = (
    deletedColumnId: string,
    prevColumnId: string
  ) => {
    const newTaskGrid = { ...taskGrid };

    rows.forEach((rowId) => {
      if (newTaskGrid[rowId]) {
        if (newTaskGrid[rowId][deletedColumnId]) {
          const tasksToMove = [...newTaskGrid[rowId][deletedColumnId]];

          // Ensure the previous column exists in this row
          if (!newTaskGrid[rowId][prevColumnId]) {
            newTaskGrid[rowId][prevColumnId] = [];
          }

          // Move tasks to the previous column
          // Tworzenie nowej tablicy z unikalnymi zadaniami
          const existingTaskIds = new Set(
            newTaskGrid[rowId][prevColumnId].map((task) => task.id)
          );
          const uniqueTasksToAdd = tasksToMove.filter(
            (task) => !existingTaskIds.has(task.id)
          );

          newTaskGrid[rowId][prevColumnId] = [
            ...newTaskGrid[rowId][prevColumnId],
            ...uniqueTasksToAdd,
          ];

          // Delete the column from this row
          delete newTaskGrid[rowId][deletedColumnId];
        }
      }
    });

    setTaskGrid(newTaskGrid);
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
      // Reset stanu inputa
      handleCancelAddingTask(rowId, colId);
    }
  };

  const handleAddRow = () => {
    if (!newRowName.trim()) {
      toast.error("Nazwa wiersza nie może być pusta!");
      return;
    }

    // Sprawdź, czy wiersz o takiej nazwie już istnieje
    if (rows.includes(newRowName.trim())) {
      if (
        !window.confirm(
          `Wiersz o nazwie "${newRowName.trim()}" już istnieje. Czy na pewno chcesz utworzyć duplikat?`
        )
      ) {
        return;
      }
    }

    const newRows = [...rows, newRowName.trim()];
    setRows(newRows);

    // Dodaj nowy wiersz do taskGrid
    const newTaskGrid = { ...taskGrid };
    newTaskGrid[newRowName.trim()] = {};

    // Inicjalizuj puste tablice zadań dla wszystkich kolumn
    Object.keys(columns).forEach((colId) => {
      newTaskGrid[newRowName.trim()][colId] = [];
    });

    setTaskGrid(newTaskGrid);
    setNewRowName("");
    setIsAddingRow(false);
    toast.success("Wiersz został dodany!");
  };
  const handleDeleteRow = (rowName: string) => {
    // Nie usuwaj domyślnego wiersza
    if (rowName === "Default") {
      toast.error("Nie można usunąć domyślnego wiersza!");
      return;
    }

    const newRows = rows.filter((r) => r !== rowName);
    setRows(newRows);

    // Usuń wiersz z taskGrid i przenieś zadania do wiersza Default
    const newTaskGrid = { ...taskGrid };

    // Przed usunięciem, przenieś zadania do wiersza Default
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
    toast.success(
      `Limit zadań dla kolumny został zaktualizowany na ${
        limit === 0 ? "brak limitu" : limit
      }!`
    );
  };

  // Funkcja pomocnicza do liczenia zadań w kolumnie we wszystkich wierszach
  const countTasksInColumn = (columnId: string): number => {
    let count = 0;
    rows.forEach((rowId) => {
      if (taskGrid[rowId] && taskGrid[rowId][columnId]) {
        count += taskGrid[rowId][columnId].length;
      }
    });
    return count;
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;

    // Obsługa zmiany kolejności kolumn
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

    // Parsowanie ID elementu do upuszczenia, aby uzyskać wiersz i kolumnę
    const sourceRowId = source.droppableId.split("-")[0];
    const sourceColId = source.droppableId.split("-")[1];
    const destRowId = destination.droppableId.split("-")[0];
    const destColId = destination.droppableId.split("-")[1];

    // Sprawdź, czy przenosimy do innej kolumny
    if (sourceColId !== destColId) {
      // Policz bieżące zadania w kolumnie docelowej
      const destColumnTaskCount = countTasksInColumn(destColId);

      // Pobierz limit WIP dla kolumny docelowej
      const destColumn = columns[destColId];
      if (
        destColumn &&
        destColumn.wipLimit > 0 &&
        destColumnTaskCount >= destColumn.wipLimit
      ) {
        toast.error(
          `Nie można dodać więcej zadań do kolumny ${destColumn.title} - limit WIP osiągnięty!`
        );
        return;
      }
    }

    // Utwórz nową siatkę zadań
    const newTaskGrid = { ...taskGrid };

    // Przenoszenie zadania w obrębie tej samej komórki
    if (sourceRowId === destRowId && sourceColId === destColId) {
      const tasks = Array.from(newTaskGrid[sourceRowId][sourceColId]);
      const [removed] = tasks.splice(source.index, 1);
      tasks.splice(destination.index, 0, removed);
      newTaskGrid[sourceRowId][sourceColId] = tasks;
    } else {
      // Przenoszenie do innej komórki
      const sourceTasks = Array.from(newTaskGrid[sourceRowId][sourceColId]);
      const [removed] = sourceTasks.splice(source.index, 1);

      // Upewnij się, że cel istnieje
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

      // Aktualizuj pozycję w bazie danych tylko jeśli zmieniła się kolumna
      if (sourceColId !== destColId) {
        const taskIdParts = draggableId.split("-");
        // Pobierz część identyfikatora zadania (powinno być "task-{dbId}-{random}")
        const taskId = taskIdParts.slice(1).join("-");

        updateTaskPosition(taskId, sourceColId, destColId);

        // Aktualizuj kolumny dla bazy danych
        const updatedColumns = { ...columns };

        // Znajdź zadanie w kolumnie źródłowej
        let movedTask = removed;

        if (movedTask) {
          updatedColumns[sourceColId] = {
            ...updatedColumns[sourceColId],
            tasks: updatedColumns[sourceColId].tasks.filter(
              (t) => t.id !== movedTask.id
            ),
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
    // Sprawdź limit WIP przed dodaniem zadania
    const currentTaskCount = countTasksInColumn(colId);
    const column = columns[colId];

    if (column && column.wipLimit > 0 && currentTaskCount >= column.wipLimit) {
      toast.error(
        `Nie można dodać więcej zadań do kolumny ${column.title} - limit WIP osiągnięty!`
      );
      return;
    }

    // Dodaj zadanie tylko jeśli tytuł nie jest pusty
    if (!taskTitle.trim()) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      content: taskTitle,
      name: taskTitle,
      users: [],
    };

    // Dodaj zadanie do kolumny w bazie danych
    onAddTask(colId, taskTitle);

    // Dodaj zadanie do konkretnej komórki w siatce
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
    // Usuń zadanie z konkretnej komórki
    const newTaskGrid = { ...taskGrid };
    if (newTaskGrid[rowId] && newTaskGrid[rowId][colId]) {
      newTaskGrid[rowId][colId] = newTaskGrid[rowId][colId].filter(
        (task) => task.id !== taskId
      );
    }

    // Usuń zadanie z kolumny w bazie danych
    onDeleteTask(colId, taskId);

    setTaskGrid(newTaskGrid);
  };

  // Funkcja do aktualizacji danych zadania (nazwa i przypisani użytkownicy)
  const handleTaskUpdate = (
    rowId: string,
    colId: string,
    taskId: string,
    updatedData: { name: string; users: IUser[] }
  ) => {
    const newTaskGrid = { ...taskGrid };

    if (newTaskGrid[rowId] && newTaskGrid[rowId][colId]) {
      const taskIndex = newTaskGrid[rowId][colId].findIndex(
        (task) => task.id === taskId
      );

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
    api
      .patch(`tasks/${actualTaskId}/assign-users`, { users: updatedData.users })
      .then(() => {
        toast.success("Zadanie zostało zaktualizowane!");
      })
      .catch((error) => {
        console.error("Błąd podczas aktualizacji zadania:", error);
        toast.error("Nie udało się zaktualizować zadania.");
      });
  };

  // Utworzenie kompatybilnego obiektu danych nagłówka dla komponentu BoardHeader
  const headerBoardData: { tableName: string } = {
    tableName: boardData?.tableName || "",
  };

  // Utworzenie zmodyfikowanej funkcji setBoardData zgodnej z oczekiwaną sygnaturą
  const handleSetBoardData = (data: { tableName: string }) => {
    if (boardData) {
      setBoardData({
        ...boardData,
        tableName: data.tableName,
      });
    } else {
      setBoardData({
        tableName: data.tableName,
        columns: [] as IColumnEntity[],
        statuses: [],
        backgroundImage: "",
        rows: [],
      } as IKanban);
    }
  };

  return (
    <div
      className={styles.kanbanBoard}
      style={{
        backgroundImage: `url(${boardData?.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
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
            deleteColumn={async (columnId) => {
              const result = await deleteColumn(columnId);
              if (result) {
                handleColumnDeleted(
                  result.deletedColumnId,
                  result.prevColumnId
                );
              }
            }}
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
