import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import styles from "./KanbanBoard.module.scss";
import { toast } from "react-toastify";
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
    rows,
    setRows,
    rowOrder,
    setRowOrder,
    onAddTask,
    onDeleteTask,
    updateTaskPosition,
    initializeBoard,
    boardData,
    setBoardData,
    updateRowWipLimit,
  } = useKanbanBoard();

  // Struktura siatki dla zadań
  const [taskGrid, setTaskGrid] = useState<{
    [rowId: string]: { [colId: string]: any[] };
  }>({});

  useEffect(() => {
    let isMounted = true;

    const fetchBoard = async () => {
      try {
        const res = await api.get<ApiResponse<IKanban>>(
          `kanban/board/${params.id}`
        );
        if (isMounted && res.data && res.data.data) {
          initializeBoard(res.data.data);

          const newTaskGrid: {
            [rowName: string]: { [colName: string]: any[] };
          } = {};

          if (res.data.data.tasks) {
            res.data.data.tasks.forEach((task: any) => {
              const rowName = task.row?.name.replace(/\s+/g, "").toLowerCase();
              const colName = task.column?.name
                .replace(/\s+/g, "")
                .toLowerCase();

              if (!newTaskGrid[rowName]) {
                newTaskGrid[rowName] = {};
              }

              if (!newTaskGrid[rowName][colName]) {
                newTaskGrid[rowName][colName] = [];
              }

              newTaskGrid[rowName][colName].push(task);
            });

            setTaskGrid(newTaskGrid);
          }
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych tablicy:", error);
        toast.error(
          "Nie udało się załadować tablicy. Spróbuj ponownie później."
        );
      }
    };

    fetchBoard();

    return () => {
      isMounted = false;
    };
  }, [params.id, initializeBoard]);

  // Aktualizacja siatki zadań po zmianie kolumn
  useEffect(() => {
    const newTaskGrid: {
      [rowId: string]: { [colId: string]: any[] };
    } = { ...taskGrid };

    Object.keys(rows).forEach((rowId) => {
      if (!newTaskGrid[rowId]) {
        newTaskGrid[rowId] = {};
      }

      Object.keys(columns).forEach((colId) => {
        if (!newTaskGrid[rowId][colId]) {
          newTaskGrid[rowId][colId] = [];
        }
      });
    });

    const defaultRow = Object.values(rows).find(
      (row) => row.title.toLowerCase() === "default"
    );

    if (defaultRow) {
      const defaultRowId = defaultRow.id;

      if (newTaskGrid[defaultRowId]) {
        Object.keys(columns).forEach((colId) => {
          if (
            !newTaskGrid[defaultRowId][colId] ||
            newTaskGrid[defaultRowId][colId].length === 0
          ) {
            newTaskGrid[defaultRowId][colId] = columns[colId].tasks.map(
              (task) => ({
                ...task,
              })
            );
          }
        });
      }
    }

    // setTaskGrid(newTaskGrid);
  }, [columnOrder]);

  // Funkcja aktualizująca taskGrid po usunięciu kolumny
  const handleColumnDeleted = (
    deletedColumnId: string,
    prevColumnId: string
  ) => {
    const newTaskGrid = { ...taskGrid };

    Object.keys(rows).forEach((rowId) => {
      if (newTaskGrid[rowId] && newTaskGrid[rowId][deletedColumnId]) {
        const tasksToMove = [...newTaskGrid[rowId][deletedColumnId]];

        if (!newTaskGrid[rowId][prevColumnId]) {
          newTaskGrid[rowId][prevColumnId] = [];
        }

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

        delete newTaskGrid[rowId][deletedColumnId];
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
      handleCancelAddingTask(rowId, colId);
    }
  };

  const handleAddRow = async () => {
    if (!newRowName.trim()) {
      toast.error("Nazwa wiersza nie może być pusta!");
      return;
    }

    const rowExists = Object.values(rows).some(
      (row) => row.title.toLowerCase() === newRowName.trim().toLowerCase()
    );

    if (rowExists) {
      if (
        !window.confirm(
          `Wiersz o nazwie "${newRowName.trim()}" już istnieje. Czy na pewno chcesz utworzyć duplikat?`
        )
      ) {
        return;
      }
    }

    try {
      const rowId = `row-${Date.now()}`;

      // Tworzenie wiersza w bazie danych
      const res = await api.post(`rows/${params.id}`, {
        name: newRowName.trim(),
        maxTasks: 0, // Domyślnie brak limitu
        order: rowOrder.length, // Dodaj na końcu
      });

      if (res.data && res.data.data) {
        const dbRowId = res.data.data.id;

        // Dodaj wiersz do stanu lokalnego
        const newRow = {
          id: rowId,
          title: newRowName.trim(),
          tasks: [],
          wipLimit: 0,
          rowId: dbRowId, // Przechowaj ID z bazy danych
        };

        setRows((prev) => ({
          ...prev,
          [rowId]: newRow,
        }));

        setRowOrder((prev) => [...prev, rowId]);

        const newTaskGrid = { ...taskGrid };
        newTaskGrid[rowId] = {};

        Object.keys(columns).forEach((colId) => {
          newTaskGrid[rowId][colId] = [];
        });

        setTaskGrid(newTaskGrid);
        setNewRowName("");
        setIsAddingRow(false);
        toast.success("Wiersz został dodany!");
      }
    } catch (error) {
      console.error("Błąd podczas dodawania wiersza:", error);
      toast.error("Nie udało się dodać wiersza. Spróbuj ponownie później.");
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (rowId === "Default" || rows[rowId].title === "Default") {
      toast.error("Nie można usunąć domyślnego wiersza!");
      return;
    }

    const rowDbId = rows[rowId]?.rowId;

    if (!rowDbId) {
      toast.error(
        "Nie można usunąć wiersza - brak identyfikatora w bazie danych!"
      );
      return;
    }

    try {
      await api.delete(`rows/${rowDbId}`);

      const newRows = Object.keys(rows)
        .filter((id) => id !== rowId)
        .reduce((acc: Record<string, (typeof rows)[string]>, id) => {
          acc[id] = rows[id];
          return acc;
        }, {} as Record<string, (typeof rows)[string]>);

      setRows(newRows);
      setRowOrder((prev) => prev.filter((id) => id !== rowId));

      const newTaskGrid = { ...taskGrid };

      // Znajdź ID wiersza domyślnego
      const defaultRowId = Object.keys(rows).find(
        (id) => rows[id].title.toLowerCase() === "default"
      );

      // Przed usunięciem przenieś zadania do wiersza domyślnego
      if (defaultRowId && newTaskGrid[rowId]) {
        Object.keys(newTaskGrid[rowId]).forEach((colId) => {
          if (!newTaskGrid[defaultRowId][colId]) {
            newTaskGrid[defaultRowId][colId] = [];
          }

          newTaskGrid[defaultRowId][colId] = [
            ...newTaskGrid[defaultRowId][colId],
            ...newTaskGrid[rowId][colId],
          ];
        });
      }

      delete newTaskGrid[rowId];
      setTaskGrid(newTaskGrid);

      toast.success("Wiersz został usunięty!");
    } catch (error) {
      console.error("Błąd podczas usuwania wiersza:", error);
      toast.error("Nie udało się usunąć wiersza. Spróbuj ponownie później.");
    }
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

  // Funkcja licząca zadania w kolumnie we wszystkich wierszach
  const countTasksInColumn = (columnId: string): number => {
    let count = 0;
    Object.keys(rows).forEach((rowId) => {
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

    // Parsowanie ID elementu do upuszczenia
    const sourceRowId = source.droppableId.split("-")[0];
    const sourceColId = source.droppableId.split("-")[1];
    const destRowId = destination.droppableId.split("-")[0];
    const destColId = destination.droppableId.split("-")[1];

    // Sprawdzenie limitów WIP przy przenoszeniu do innej kolumny lub wiersza
    if (sourceColId !== destColId) {
      const destColumnTaskCount = countTasksInColumn(destColId);
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

    // Sprawdzenie limitu WIP dla wiersza docelowego
    if (sourceRowId !== destRowId) {
      const row = rows[destRowId];
      if (row && row.wipLimit > 0) {
        const tasksInDestRow = Object.values(taskGrid[destRowId] || {}).flat()
          .length;
        if (tasksInDestRow >= row.wipLimit) {
          toast.error(
            `Nie można dodać więcej zadań do wiersza ${row.title} - limit WIP osiągnięty!`
          );
          return;
        }
      }
    }

    const newTaskGrid = { ...taskGrid };

    // Przenoszenie zadania w tej samej komórce
    if (sourceRowId === destRowId && sourceColId === destColId) {
      const tasks = Array.from(newTaskGrid[sourceRowId][sourceColId]);
      const [removed] = tasks.splice(source.index, 1);
      tasks.splice(destination.index, 0, removed);
      newTaskGrid[sourceRowId][sourceColId] = tasks;
    } else {
      // Przenoszenie do innej komórki
      const sourceTasks = Array.from(newTaskGrid[sourceRowId][sourceColId]);
      const [removed] = sourceTasks.splice(source.index, 1);

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

      // Aktualizacja pozycji w bazie danych przy zmianie kolumny lub wiersza
      if (sourceColId !== destColId || sourceRowId !== destRowId) {
        const taskIdParts = draggableId.split("-");
        const taskId = taskIdParts.slice(1).join("-");

        // Wywołanie zaktualizowanej funkcji z informacjami o wierszu
        updateTaskPosition(
          taskId,
          sourceColId,
          destColId,
          sourceRowId,
          destRowId
        );

        // Aktualizacja lokalnych stanów
        const updatedColumns = { ...columns };
        let movedTask = removed;

        if (movedTask) {
          // Aktualizacja informacji o zadaniu - nowy rowId
          movedTask = {
            ...movedTask,
            rowId: rows[destRowId].rowId, // Ustawienie nowego rowId
          };

          // Tylko jeśli zmieniamy kolumnę, aktualizujemy stan kolumn
          if (sourceColId !== destColId) {
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
    }

    setTaskGrid(newTaskGrid);
  };

  const onAddTaskToCell = (rowId: string, colId: string, taskTitle: string) => {
    // Sprawdzenie limitu WIP przed dodaniem zadania
    const currentTaskCount = countTasksInColumn(colId);
    const column = columns[colId];

    if (column && column.wipLimit > 0 && currentTaskCount >= column.wipLimit) {
      toast.error(
        `Nie można dodać więcej zadań do kolumny ${column.title} - limit WIP osiągnięty!`
      );
      return;
    }

    if (!taskTitle.trim()) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      content: taskTitle,
      name: taskTitle,
      users: [],
    };

    // Dodanie zadania do bazy danych
    onAddTask(rowId, colId, taskTitle);

    // Dodanie zadania do lokalnej siatki
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
    const newTaskGrid = { ...taskGrid };
    if (newTaskGrid[rowId] && newTaskGrid[rowId][colId]) {
      newTaskGrid[rowId][colId] = newTaskGrid[rowId][colId].filter(
        (task) => task.id !== taskId
      );
    }

    onDeleteTask(colId, taskId);
    setTaskGrid(newTaskGrid);
  };

  // Aktualizacja danych zadania (nazwa i przypisani użytkownicy)
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

  // Przygotowanie danych dla nagłówka tablicy
  const headerBoardData: { tableName: string } = {
    tableName: boardData?.tableName || "",
  };

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

  const handleRowWipLimitUpdate = (rowId: string, newWipLimit: number) => {
    updateRowWipLimit(rowId, newWipLimit);
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
            addColumn={() => addColumn(Number(params.id))}
          />

          <KanbanGrid
            rows={rows}
            rowOrder={rowOrder}
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
            handleRowWipLimitUpdate={handleRowWipLimitUpdate}
          />
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;
