import { useState } from "react";

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

  return {
    rows,
    setRows,
    rowOrder,
    setRowOrder,
  };
}
