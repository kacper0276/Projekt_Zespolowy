import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useApiJson } from "../config/api";
import { ApiResponse } from "../types/api.types";
import { IRow } from "../interfaces/IRow";

interface RowState {
  [key: string]: {
    id: string;
    title: string;
    tasks: any[];
    wipLimit: number;
    rowId?: number; // Store the actual database ID
  };
}

export function useRow() {
  const [rows, setRows] = useState<RowState>({});
  const [rowOrder, setRowOrder] = useState<string[]>([]);
  const [newRowTitle, setNewRowTitle] = useState("");
  const api = useApiJson();

  // Initialize rows from API data
  const initializeRows = useCallback((rowsData: IRow[]) => {
    const initialRows: RowState = {};
    const initialRowOrder: string[] = [];

    const sortedRows = [...rowsData].sort((a, b) => a.order - b.order);

    sortedRows.forEach((row) => {
      const rowId = row.name.toLowerCase().replace(/\s+/g, "");

      initialRows[rowId] = {
        id: rowId,
        title: row.name,
        tasks: (row.tasks || [])
          .sort((a, b) => a.order - b.order)
          .map((task) => ({
            id: `task-${task.id || Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            content: task.name,
            name: task.name,
            description: task.description,
            status: task.status,
            priority: task.priority,
            deadline: task.deadline,
            users: task.users || [],
            dbId: task.id,
          })),
        wipLimit: row.maxTasks || 0,
        rowId: row.id,
      };

      initialRowOrder.push(rowId);
    });

    setRows(initialRows);
    setRowOrder(initialRowOrder);
  }, []);

  // Add a new row
  const addRow = async (kanbanId?: number) => {
    if (!newRowTitle.trim() || !kanbanId) return;

    const rowId = newRowTitle.toLowerCase().replace(/\s+/g, "");

    if (rows[rowId]) {
      toast.error("Rząd o tej nazwie już istnieje!");
      return;
    }

    try {
      const newRowResponse = await api.post<ApiResponse<IRow>>(
        `rows/${kanbanId}`,
        {
          name: newRowTitle,
        }
      );

      const newRow = {
        id: rowId,
        title: newRowTitle,
        tasks: [],
        wipLimit: 0,
        rowId: newRowResponse.data.data?.id,
      };

      setRows((prev) => ({
        ...prev,
        [rowId]: newRow,
      }));

      setRowOrder((prev) => [...prev, rowId]);
      setNewRowTitle("");

      toast.success(`Dodano rząd ${newRowTitle}`);
    } catch (error) {
      console.error("Error creating row:", error);
      toast.error("Nie udało się dodać rzędu. Spróbuj ponownie później.");
    }
  };

  // Update row order
  const updateRowOrder = async (kanbanId: number, newOrder: string[]) => {
    try {
      const orderData = newOrder.map((rowId, index) => ({
        rowId: rows[rowId].rowId,
        order: index,
      }));

      await api.patch(`rows/edit-order/${kanbanId}`, orderData);

      setRowOrder(newOrder);
      toast.success("Zaktualizowano kolejność rzędów");
    } catch (error) {
      console.error("Error updating row order:", error);
      toast.error("Nie udało się zaktualizować kolejności rzędów.");
    }
  };

  // Update WIP limit for a row
  const updateRowWipLimit = async (rowId: string, limit: number) => {
    if (limit < 0) {
      toast.error("Limit zadań nie może być ujemny!");
      return;
    }

    const row = rows[rowId];
    if (!row || !row.rowId) {
      toast.error(
        "Nie można zaktualizować limitu - brak identyfikatora rzędu!"
      );
      return;
    }

    try {
      await api.patch(`rows/edit-wip-limit/${row.rowId}`, {
        maxTasks: limit,
      });

      setRows((prev) => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          wipLimit: limit,
        },
      }));

      toast.success(`Zmieniono limit zadań dla rzędu ${rows[rowId].title}`);
    } catch (error) {
      console.error("Error updating row WIP limit:", error);
      toast.error("Nie udało się zaktualizować limitu zadań.");
    }
  };

  // Delete a row
  const deleteRow = async (rowId: string) => {
    // Get the row's database ID
    const rowDbId = rows[rowId]?.rowId;

    if (!rowDbId) {
      toast.error(
        "Nie można usunąć rzędu - brak identyfikatora w bazie danych!"
      );
      return null;
    }

    try {
      await api.delete(`rows/${rowDbId}`);

      const updatedRows = { ...rows };
      delete updatedRows[rowId];

      setRows(updatedRows);
      setRowOrder((prev) => prev.filter((id) => id !== rowId));

      toast.success(`Usunięto rząd ${rows[rowId].title}`);

      return {
        deletedRowId: rowId,
      };
    } catch (error) {
      console.error("Error deleting row:", error);
      toast.error("Nie udało się usunąć rzędu. Spróbuj ponownie później.");
      return null;
    }
  };

  // Check if adding a task would violate WIP limits
  const canAddTaskToRow = (rowId: string) => {
    const row = rows[rowId];
    if (!row) return false;

    if (row.wipLimit === 0) return true;

    return row.tasks.length < row.wipLimit;
  };

  // Check if moving a task would violate WIP limits
  const checkRowWipLimitForMove = (
    sourceRowId: string,
    destinationRowId: string
  ) => {
    if (sourceRowId === destinationRowId) return true;

    const destRow = rows[destinationRowId];
    if (destRow.wipLimit === 0) return true;

    if (destRow.tasks.length >= destRow.wipLimit) {
      toast.error(`Rząd ${destRow.title} osiągnął limit zadań!`);
      return false;
    }

    return true;
  };

  return {
    rows,
    setRows,
    rowOrder,
    setRowOrder,
    newRowTitle,
    setNewRowTitle,
    initializeRows,
    addRow,
    updateRowOrder,
    updateRowWipLimit,
    deleteRow,
    canAddTaskToRow,
    checkRowWipLimitForMove,
  };
}
