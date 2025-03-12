import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import styles from "./KanbanBoard.module.scss";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { UserType } from "../../interfaces/IUser";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";

type TaskData = {
  id: string;
  title: string;
};

type CellData = {
  id: string;
  tasks: TaskData[];
  uniqueCounter: number;
};

type RowData = {
  id: string;
  title: string;
  cells: { [key: string]: CellData };
  wipLimit: number;
};

type GridState = {
  rows: { [key: string]: RowData };
  columns: { id: string; title: string; wipLimit: number }[];
  rowOrder: string[];
};

function KanbanBoard() {
  useWebsiteTitle("Kanban Board");
  const api = useApiJson();

  const [newColumnTitle, setNewColumnTitle] = useState<string>("");
  const [newRowTitle, setNewRowTitle] = useState<string>("");
  const [grid, setGrid] = useState<GridState>({
    rows: {},
    columns: [],
    rowOrder: [],
  });
  const [users, setUsers] = useState<UserType[]>([]);

  // Stan dla edycji WIP limitów
  const [editingColumnWip, setEditingColumnWip] = useState<string | null>(null);
  const [editingRowWip, setEditingRowWip] = useState<string | null>(null);
  const [tempWipValue, setTempWipValue] = useState<number>(0);

  useEffect(() => {
    if (grid.columns.length === 0) {
      const defaultColumns = [
        { id: "todo", title: "To Do", wipLimit: 0 },
        { id: "inprogress", title: "In Progress", wipLimit: 5 },
        { id: "done", title: "Done", wipLimit: 0 },
      ];

      const defaultRows = {
        row1: {
          id: "row1",
          title: "Basia",
          wipLimit: 0,
          cells: {
            todo: {
              id: "todo",
              tasks: [],
              uniqueCounter: 0,
              wipLimit: 0,
            },
            inprogress: {
              id: "inprogress",
              tasks: [],
              uniqueCounter: 0,
              wipLimit: 5,
            },
            done: {
              id: "done",
              tasks: [],
              uniqueCounter: 0,
              wipLimit: 0,
            },
          },
        },
        row2: {
          id: "row2",
          title: "Adam",
          wipLimit: 0,
          cells: {
            todo: {
              id: "todo",
              tasks: [],
              uniqueCounter: 0,
              wipLimit: 0,
            },
            inprogress: {
              id: "inprogress",
              tasks: [],
              uniqueCounter: 0,
              wipLimit: 5,
            },
            done: {
              id: "done",
              tasks: [],
              uniqueCounter: 0,
              wipLimit: 0,
            },
          },
        },
      };

      setGrid({
        rows: defaultRows,
        columns: defaultColumns,
        rowOrder: ["row1", "row2"],
      });

      api.get<ApiResponse<UserType[]>>("users/all").then((response) => {
        setUsers(response.data.data ?? []);
      });
    }
  }, []);

  // Funkcja do rozpoczęcia edycji WIP limitu kolumny
  const startEditingColumnWip = (columnId: string) => {
    const column = grid.columns.find((col) => col.id === columnId);
    if (column) {
      setEditingColumnWip(columnId);
      setTempWipValue(column.wipLimit);
    }
  };

  // Funkcja do rozpoczęcia edycji WIP limitu wiersza
  const startEditingRowWip = (rowId: string) => {
    const row = grid.rows[rowId];
    if (row) {
      setEditingRowWip(rowId);
      setTempWipValue(row.wipLimit);
    }
  };

  // Funkcja do zapisania edycji WIP limitu kolumny
  const saveColumnWipLimit = () => {
    if (editingColumnWip) {
      setGrid((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === editingColumnWip ? { ...col, wipLimit: tempWipValue } : col
        ),
      }));
      setEditingColumnWip(null);
    }
  };

  // Funkcja do zapisania edycji WIP limitu wiersza
  const saveRowWipLimit = () => {
    if (editingRowWip) {
      setGrid((prev) => ({
        ...prev,
        rows: {
          ...prev.rows,
          [editingRowWip]: {
            ...prev.rows[editingRowWip],
            wipLimit: tempWipValue,
          },
        },
      }));
      setEditingRowWip(null);
    }
  };

  // Funkcja do anulowania edycji WIP limitu
  const cancelWipEdit = () => {
    setEditingColumnWip(null);
    setEditingRowWip(null);
  };

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      const normalizedColumnId = newColumnTitle
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const uniqueColumnId = grid.columns.some(
        (col) => col.id === normalizedColumnId
      )
        ? `${normalizedColumnId}-${grid.columns.length}`
        : normalizedColumnId;

      setGrid((prev) => {
        const newColumns = [
          ...prev.columns,
          { id: uniqueColumnId, title: newColumnTitle.trim(), wipLimit: 0 },
        ];

        // Add new cell to each row for this column
        const updatedRows = { ...prev.rows };
        Object.keys(updatedRows).forEach((rowId) => {
          updatedRows[rowId] = {
            ...updatedRows[rowId],
            cells: {
              ...updatedRows[rowId].cells,
              [uniqueColumnId]: {
                id: uniqueColumnId,
                tasks: [],
                uniqueCounter: 0,
              },
            },
          };
        });

        return {
          ...prev,
          columns: newColumns,
          rows: updatedRows,
        };
      });

      setNewColumnTitle("");
    }
  };

  const addRow = () => {
    if (newRowTitle.trim()) {
      const normalizedRowId = newRowTitle
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const uniqueRowId = grid.rowOrder.includes(normalizedRowId)
        ? `${normalizedRowId}-${grid.rowOrder.length}`
        : normalizedRowId;

      setGrid((prev) => {
        // Create cells for the new row
        const newCells: { [key: string]: CellData } = {};
        prev.columns.forEach((column) => {
          newCells[column.id] = {
            id: column.id,
            tasks: [],
            uniqueCounter: 0,
          };
        });

        // Add new row
        const updatedRows = {
          ...prev.rows,
          [uniqueRowId]: {
            id: uniqueRowId,
            title: newRowTitle.trim(),
            wipLimit: 0,
            cells: newCells,
          },
        };

        return {
          ...prev,
          rows: updatedRows,
          rowOrder: [...prev.rowOrder, uniqueRowId],
        };
      });

      setNewRowTitle("");
    }
  };

  const deleteColumn = (columnId: string) => {
    if (["todo", "inprogress", "done"].includes(columnId)) {
      toast.error("Nie można usunąć domyślnych kolumn", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setGrid((prev) => {
      // Remove column from columns array
      const newColumns = prev.columns.filter((col) => col.id !== columnId);

      // Remove cells for this column from all rows
      const updatedRows = { ...prev.rows };
      Object.keys(updatedRows).forEach((rowId) => {
        const newCells = { ...updatedRows[rowId].cells };
        delete newCells[columnId];
        updatedRows[rowId] = {
          ...updatedRows[rowId],
          cells: newCells,
        };
      });

      return {
        ...prev,
        columns: newColumns,
        rows: updatedRows,
      };
    });
  };

  const deleteRow = (rowId: string) => {
    setGrid((prev) => {
      const newRows = { ...prev.rows };
      delete newRows[rowId];
      return {
        ...prev,
        rows: newRows,
        rowOrder: prev.rowOrder.filter((id) => id !== rowId),
      };
    });
  };

  const canAddTaskToCell = (rowId: string, columnId: string) => {
    const row = grid.rows[rowId];
    const column = grid.columns.find((col) => col.id === columnId);

    // Sprawdź limity WIP dla komórki, wiersza i kolumny
    const rowLimitOk =
      row.wipLimit === 0 || getTotalTasksInRow(rowId) < row.wipLimit;
    const columnLimitOk =
      !column ||
      column.wipLimit === 0 ||
      getTotalTasksInColumn(columnId) < column.wipLimit;

    return rowLimitOk && columnLimitOk;
  };

  // Funkcja do liczenia wszystkich zadań w wierszu
  const getTotalTasksInRow = (rowId: string) => {
    const row = grid.rows[rowId];
    return Object.values(row.cells).reduce(
      (total, cell) => total + cell.tasks.length,
      0
    );
  };

  // Funkcja do liczenia wszystkich zadań w kolumnie
  const getTotalTasksInColumn = (columnId: string) => {
    return Object.values(grid.rows).reduce((total, row) => {
      const cell = row.cells[columnId];
      return total + (cell ? cell.tasks.length : 0);
    }, 0);
  };

  const onAddTask = (rowId: string, columnId: string, taskTitle: string) => {
    if (!canAddTaskToCell(rowId, columnId)) {
      toast.error(`Nie można dodać zadania - przekroczony limit WIP`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setGrid((prev) => {
      const row = prev.rows[rowId];
      const cell = row.cells[columnId];
      const newTask: TaskData = {
        id: `task-${rowId}-${columnId}-${cell.uniqueCounter}`,
        title: taskTitle,
      };

      return {
        ...prev,
        rows: {
          ...prev.rows,
          [rowId]: {
            ...row,
            cells: {
              ...row.cells,
              [columnId]: {
                ...cell,
                tasks: [...cell.tasks, newTask],
                uniqueCounter: cell.uniqueCounter + 1,
              },
            },
          },
        },
      };
    });
  };

  const onDeleteTask = (rowId: string, columnId: string, taskIndex: number) => {
    setGrid((prev) => {
      const row = prev.rows[rowId];
      const cell = row.cells[columnId];
      const newTasks = cell.tasks.filter((_, index) => index !== taskIndex);

      return {
        ...prev,
        rows: {
          ...prev.rows,
          [rowId]: {
            ...row,
            cells: {
              ...row.cells,
              [columnId]: {
                ...cell,
                tasks: newTasks,
              },
            },
          },
        },
      };
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    // Handle row reordering
    if (type === "ROW") {
      if (destination.index === source.index) return;
      const newRowOrder = Array.from(grid.rowOrder);
      const [reorderedRow] = newRowOrder.splice(source.index, 1);
      newRowOrder.splice(destination.index, 0, reorderedRow);

      setGrid((prev) => ({
        ...prev,
        rowOrder: newRowOrder,
      }));
      return;
    }

    if (type === "COLUMN") {
      if (destination.index === source.index) return;
      const newColumns = Array.from(grid.columns);
      const [reorderedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, reorderedColumn);

      setGrid((prev) => ({
        ...prev,
        columns: newColumns,
      }));
      return;
    }

    const [sourceRowId, sourceColId] = source.droppableId.split("-");
    const [destRowId, destColId] = destination.droppableId.split("-");

    const sourceRow = grid.rows[sourceRowId];
    const sourceCell = sourceRow.cells[sourceColId];
    const destRow = grid.rows[destRowId];
    const destCell = destRow.cells[destColId];
    const destColumn = grid.columns.find((col) => col.id === destColId);

    // Sprawdź limity WIP dla wiersza i kolumny
    if (sourceRowId !== destRowId || sourceColId !== destColId) {
      // Sprawdź limit WIP dla wiersza docelowego
      if (destRow.wipLimit > 0) {
        const totalTasksInDestRow = getTotalTasksInRow(destRowId);
        if (totalTasksInDestRow >= destRow.wipLimit) {
          toast.error(
            `Nie można przenieść zadania - osiągnięto limit WIP wiersza (${destRow.wipLimit})`,
            {
              position: "top-center",
              autoClose: 3000,
            }
          );
          return;
        }
      }

      // Sprawdź limit WIP dla kolumny docelowej
      if (destColumn && destColumn.wipLimit > 0) {
        const totalTasksInDestColumn = getTotalTasksInColumn(destColId);
        if (totalTasksInDestColumn >= destColumn.wipLimit) {
          toast.error(
            `Nie można przenieść zadania - osiągnięto limit WIP kolumny (${destColumn.wipLimit})`,
            {
              position: "top-center",
              autoClose: 3000,
            }
          );
          return;
        }
      }
    }

    // Moving within the same cell
    if (sourceRowId === destRowId && sourceColId === destColId) {
      const newTasks = Array.from(sourceCell.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      setGrid((prev) => ({
        ...prev,
        rows: {
          ...prev.rows,
          [sourceRowId]: {
            ...sourceRow,
            cells: {
              ...sourceRow.cells,
              [sourceColId]: {
                ...sourceCell,
                tasks: newTasks,
              },
            },
          },
        },
      }));
    } else {
      // Moving to a different cell
      const sourceTasks = Array.from(sourceCell.tasks);
      const destTasks = Array.from(destCell.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);

      setGrid((prev) => {
        const updatedGrid = { ...prev };

        // Update source cell
        updatedGrid.rows[sourceRowId] = {
          ...updatedGrid.rows[sourceRowId],
          cells: {
            ...updatedGrid.rows[sourceRowId].cells,
            [sourceColId]: {
              ...updatedGrid.rows[sourceRowId].cells[sourceColId],
              tasks: sourceTasks,
            },
          },
        };

        // Update destination cell
        updatedGrid.rows[destRowId] = {
          ...updatedGrid.rows[destRowId],
          cells: {
            ...updatedGrid.rows[destRowId].cells,
            [destColId]: {
              ...updatedGrid.rows[destRowId].cells[destColId],
              tasks: destTasks,
            },
          },
        };

        return updatedGrid;
      });
    }
  };

  const renderCell = (rowId: string, columnId: string) => {
    const row = grid.rows[rowId];
    if (!row) return null;

    const cell = row.cells[columnId];
    if (!cell) return null;

    return (
      <div className={styles.gridCell}>
        <div className={styles.cellContent}>
          <Droppable droppableId={`${rowId}-${columnId}`} type="TASK">
            {(provided) => (
              <div
                className={styles.tasksList}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {cell.tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        className={styles.taskItem}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className={styles.taskContent}>
                          <span>{task.title}</span>
                          <button
                            className={styles.deleteTaskButton}
                            onClick={() => onDeleteTask(rowId, columnId, index)}
                          >
                            ×
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

          <div className={styles.addTaskForm}>
            <input
              type="text"
              placeholder="Nowe zadanie..."
              className={styles.taskInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  onAddTask(rowId, columnId, e.currentTarget.value.trim());
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Renderowanie WIP limitu dla wiersza
  const renderRowWipLimit = (rowId: string) => {
    const row = grid.rows[rowId];
    const totalTasks = getTotalTasksInRow(rowId);
    const isLimitReached = row.wipLimit > 0 && totalTasks >= row.wipLimit;
    const limitClass = isLimitReached
      ? `${styles.wipLimit} ${styles.limitReached}`
      : styles.wipLimit;

    if (editingRowWip === rowId) {
      return (
        <div className={styles.limitEditor}>
          <div className={styles.limitInputGroup}>
            <input
              type="number"
              min="0"
              className={styles.limitInput}
              value={tempWipValue}
              onChange={(e) => {
                // Konwertuj wartość na liczbę i ustaw nową wartość
                const newValue =
                  e.target.value === "" ? 0 : parseInt(e.target.value);
                setTempWipValue(newValue);
              }}
              onFocus={(e) => {
                // Gdy pole otrzymuje fokus i wartość to 0, wyczyść pole
                if (tempWipValue === 0) {
                  e.target.value = "";
                }
              }}
            />
            <div className={styles.limitButtons}>
              <button
                className={styles.confirmLimitButton}
                onClick={saveRowWipLimit}
              >
                ✓
              </button>
              <button
                className={styles.cancelLimitButton}
                onClick={cancelWipEdit}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={limitClass} onClick={() => startEditingRowWip(rowId)}>
        {row.wipLimit > 0 ? `${totalTasks}/${row.wipLimit}` : "WIP: ∞"}
      </div>
    );
  };

  return (
    <div className={styles.kanbanBoard}>
      <ToastContainer theme="dark" />
      <div className={styles.boardHeader}>
        <h1>Tablica Kanban</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.gridContainer}>
          {/* Column headers - draggable */}
          <div className={styles.columnHeaders}>
            <div className={styles.rowTitleHeader}>Wiersz / Kolumna</div>
            <Droppable
              droppableId="column-headers"
              direction="horizontal"
              type="COLUMN"
            >
              {(provided) => (
                <div
                  className={styles.columnTitles}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {grid.columns.map((column, index) => {
                    const totalTasks = getTotalTasksInColumn(column.id);
                    const isLimitReached =
                      column.wipLimit > 0 && totalTasks >= column.wipLimit;
                    const limitClass = isLimitReached
                    ? `${styles.wipLimit} ${styles.limitReached}`
                    : styles.wipLimit;
                      
                    const columnClass = isLimitReached
                      ? `${styles.columnTitle} ${styles.limitReached}`
                      : styles.columnTitle;
                    

                    return (
                      <Draggable
                        key={column.id}
                        draggableId={`col-${column.id}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className={columnClass}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <span>{column.title}</span>
                            {!["todo", "inprogress", "done"].includes(
                              column.id
                            ) && (
                              <button
                                className={styles.deleteColumnButton}
                                onClick={() => deleteColumn(column.id)}
                              >
                                ×
                              </button>
                            )}

                            {editingColumnWip === column.id ? (
                              <div className={styles.limitEditor}>
                                <div className={styles.limitInputGroup}>
                                  <input
                                    type="number"
                                    min="0"
                                    className={styles.limitInput}
                                    value={tempWipValue}
                                    onChange={(e) => {
                                      const newValue =
                                        e.target.value === ""
                                          ? 0
                                          : parseInt(e.target.value);
                                      setTempWipValue(newValue);
                                    }}
                                    onFocus={(e) => {
                                      if (tempWipValue === 0) {
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                  <div className={styles.limitButtons}>
                                    <button
                                      className={styles.confirmLimitButton}
                                      onClick={saveColumnWipLimit}
                                    >
                                      ✓
                                    </button>
                                    <button
                                      className={styles.cancelLimitButton}
                                      onClick={cancelWipEdit}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className={styles.columnActions}>
                                <div
                                  className={limitClass}
                                  onClick={() =>
                                    startEditingColumnWip(column.id)
                                  }
                                >
                                  {column.wipLimit > 0
                                    ? `${totalTasks}/${column.wipLimit}`
                                    : "WIP: ∞"}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className={styles.addColumnForm}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Nowa kolumna"
                className={styles.columnInput}
              />
              <button onClick={addColumn} className={styles.addButton}>
                +
              </button>
            </div>
          </div>

          {/* Grid rows */}
          <div className={styles.gridRows}>
            <Droppable droppableId="rows" type="ROW">
              {(provided) => (
                <div
                  className={styles.rowsContainer}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {grid.rowOrder.map((rowId, rowIndex) => {
                    const row = grid.rows[rowId];
                    if (!row) return null;

                    const totalRowTasks = getTotalTasksInRow(rowId);
                    const isRowLimitReached =
                      row.wipLimit > 0 && totalRowTasks >= row.wipLimit;
                    const rowClass = isRowLimitReached
                      ? `${styles.rowTitle} ${styles.limitReached}`
                      : styles.rowTitle;

                    return (
                      <Draggable
                        key={row.id}
                        draggableId={`row-${row.id}`}
                        index={rowIndex}
                      >
                        {(provided) => (
                          <div
                            className={`${styles.gridRow}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <div
                              className={rowClass}
                              {...provided.dragHandleProps}
                            >
                              <span>{row.title}</span>
                              <button
                                className={styles.deleteRowButton}
                                onClick={() => deleteRow(row.id)}
                              >
                                ×
                              </button>
                              <div className={styles.rowActions}>
                                {renderRowWipLimit(row.id)}
                              </div>
                            </div>

                            <div className={styles.rowCells}>
                              {grid.columns.map((column) => (
                                <div
                                  key={column.id}
                                  className={styles.cellWrapper}
                                >
                                  {renderCell(row.id, column.id)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add new row form */}
            <div className={styles.addRowForm}>
              <input
                type="text"
                value={newRowTitle}
                onChange={(e) => setNewRowTitle(e.target.value)}
                placeholder="Nowy wiersz"
                className={styles.rowInput}
              />
              <button onClick={addRow} className={styles.addButton}>
                +
              </button>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;
