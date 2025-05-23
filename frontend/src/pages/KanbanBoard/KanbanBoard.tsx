import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import styles from "./KanbanBoard.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useKanbanBoard } from "../../hooks/useKanbanBoard";
import ActionButton from "../../components/ActionButton/ActionButton";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useApiJson } from "../../config/api";
import { IUser } from "../../interfaces/IUser";
import BoardHeader from "../../components/BoardHeader/BoardHeader";
import ColumnHeader from "../../components/ColumnHeader/ColumnHeader";
import KanbanGrid from "../../components/KanbanGrid/KanbanGrid";
import { IColumnEntity } from "../../interfaces/IColumnEntity";
import { ApiResponse } from "../../types/api.types";
import { IKanban } from "../../interfaces/IKanban";
import { useTranslation } from "react-i18next";

function KanbanBoard() {
  const { t } = useTranslation();
  useWebsiteTitle(t("kanban-board"));
  const params = useParams<{ id: string }>();
  const api = useApiJson();
  const bars = useRef<HTMLDivElement>(null);
  const strengthDiv = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  const [initColumns, setInitColumns] = useState<IColumnEntity[]>([]);
  const [newRowName, setNewRowName] = useState<string>("");
  const [isAddingRow, setIsAddingRow] = useState<boolean>(false);
  const [isAddingTaskMap, setIsAddingTaskMap] = useState<{
    [key: string]: boolean;
  }>({});
  const [newTaskTitleMap, setNewTaskTitleMap] = useState<{
    [key: string]: string;
  }>({});
  // const [showChatModal, setShowChatModal] = useState<boolean>(false);

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
    columnChangeSubject,
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
        toast.error(t("failed-fetching-board-data-try-again-later"));
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

      if (newTaskGrid[defaultRowId] && false) {
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
      toast.error(t("row-name-can-not-be-empty"));
      return;
    }

    const rowExists = Object.values(rows).some(
      (row) => row.title.toLowerCase() === newRowName.trim().toLowerCase()
    );

    if (rowExists) {
      if (
        !window.confirm(
          t("duplicate-row-confirmation", { rowName: newRowName.trim() })
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
        toast.success(t("row-added-succesfully"));
      }
    } catch (error) {
      toast.error(t("failed-adding-row-try-again-later"));
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (rowId === "Default" || rows[rowId].title === "Default") {
      toast.error(t("can-not-delete-default-row"));
      return;
    }

    const rowDbId = rows[rowId]?.rowId;

    if (!rowDbId) {
      toast.error(t("can-not-delete-row-id-not-found"));
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

      toast.success(t("row-deleted-succesfully"));
    } catch (error) {
      toast.error(t("failed-deleting-row-try-again-later"));
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
      t("task-limit-updated", {
        limit: limit === 0 ? t("no-limit") : limit,
      })
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

// Modified onDragEnd function to allow exceeding WIP limits but show a warning
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
  // Zmodyfikowane, aby ostrzegać zamiast blokować
  if (sourceColId !== destColId) {
    const destColumnTaskCount = countTasksInColumn(destColId);
    const destColumn = columns[destColId];
    if (
      destColumn &&
      destColumn.wipLimit > 0 &&
      destColumnTaskCount >= destColumn.wipLimit
    ) {
      // Wyświetl ostrzeżenie zamiast błędu
      toast.warning(
        t("wip-limit-exceeded-for-column", { column: destColumn.title })
      );
      // Kontynuuj operację mimo przekroczenia limitu
    }
  }

  // Sprawdzenie limitu WIP dla wiersza docelowego
  // Również zmodyfikowane, aby ostrzegać zamiast blokować
  if (sourceRowId !== destRowId) {
    const row = rows[destRowId];
    if (row && row.wipLimit > 0) {
      const tasksInDestRow = Object.values(taskGrid[destRowId] || {}).flat().length;
      if (tasksInDestRow >= row.wipLimit) {
        // Wyświetl ostrzeżenie zamiast błędu
        toast.warning(
          t("wip-limit-exceeded-for-row", { row: row.title })
        );
        // Kontynuuj operację mimo przekroczenia limitu
      }
    }
  }

  const newTaskGrid = { ...taskGrid };

  // Reszta funkcji pozostaje bez zmian...
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
};

// Zmodyfikowana funkcja onAddTaskToCell, aby pozwalać na przekraczanie limitów WIP
const onAddTaskToCell = (rowId: string, colId: string, taskTitle: string) => {
  // Sprawdzenie limitu WIP przed dodaniem zadania - zmienione na ostrzeżenie
  const currentTaskCount = countTasksInColumn(colId);
  const column = columns[colId];

  if (column && column.wipLimit > 0 && currentTaskCount >= column.wipLimit) {
    // Wyświetl ostrzeżenie zamiast błędu
    toast.warning(
      t("wip-limit-exceeded-for-column", { column: column.title })
    );
    // Kontynuuj dodawanie zadania mimo przekroczenia limitu
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
        kanbanSettings: [],
      } as IKanban);
    }
  };

  const handleRowWipLimitUpdate = (rowId: string, newWipLimit: number) => {
    updateRowWipLimit(rowId, newWipLimit);
  };

  const calculateProgress = (
    sourceColumnName: string = "",
    destinationColumnName: string = ""
  ): number => {
    let totalTasks = 0;
    let completedTasks = 0;

    if (initColumns.length === 0) {
      const columnsArray: any[] = [];
      Object.keys(columns).forEach((colId) => {
        const column = columns[colId];

        columnsArray.push(column);

        if (column.title === "Done") completedTasks = column.tasks.length;

        totalTasks += column.tasks.length;
      });

      setInitColumns(columnsArray);

      return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    } else {
      initColumns.forEach((column) => {
        if (column.id?.toString() === sourceColumnName && column.tasks) {
          column.tasks.length = Math.max(0, column.tasks.length - 1);
        }

        if (column.id?.toString() === destinationColumnName && column.tasks) {
          column.tasks.length = Math.max(0, column.tasks.length + 1);
        }

        if (column.id?.toString() === "done")
          completedTasks = column.tasks?.length || 0;

        totalTasks += column.tasks?.length || 0;
      });

      return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    }
  };

  // const toggleChatModal = () => {
  //   setShowChatModal((prev) => !prev);
  // };

  useEffect(() => {
    subscriptionRef.current = columnChangeSubject.subscribe(
      ({ sourceColumnName, destinationColumnName }) => {
        const progress = calculateProgress(
          sourceColumnName,
          destinationColumnName
        );

        if (strengthDiv.current) {
          strengthDiv.current.style.width = `${progress}%`;
          strengthDiv.current.style.backgroundColor =
            progress < 50 ? "red" : progress < 80 ? "yellow" : "green";
        }
      }
    );
  }, [columnChangeSubject]);

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
      <div className={styles.headerContainer}>
        <BoardHeader
          boardData={headerBoardData}
          setBoardData={handleSetBoardData}
          api={api}
          params={{ id: params.id || "" }}
        />

        {/* <button className={styles.chatButton} onClick={toggleChatModal}>
          <i className="bi bi-chat"></i>
        </button> */}
      </div>

      <div id={`${styles.bars}`} ref={bars}>
        <div className={`${styles.strength}`} ref={strengthDiv}></div>
      </div>

      <div className={styles.boardControls}>
        <div className={styles.rowControls}>
          {isAddingRow ? (
            <div className={styles.addRowForm}>
              <input
                type="text"
                value={newRowName}
                onChange={(e) => setNewRowName(e.target.value)}
                placeholder={t("new-row-name")}
                className={styles.rowInput}
              />
              <div className={styles.rowActions}>
                <ActionButton
                  onClick={handleAddRow}
                  variant="success"
                  disabled={!newRowName.trim()}
                >
                  {t("add")}
                </ActionButton>
                <ActionButton
                  onClick={() => setIsAddingRow(false)}
                  variant="default"
                >
                  {t("cancel")}
                </ActionButton>
              </div>
            </div>
          ) : (
            <ActionButton
              onClick={() => setIsAddingRow(true)}
              variant="primary"
            >
              {t("add-new-row")}
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
            statuses={boardData?.statuses}
          />
        </div>
      </DragDropContext>

      {/* {showChatModal && <Chat />} */}
    </div>
  );
}

export default KanbanBoard;
