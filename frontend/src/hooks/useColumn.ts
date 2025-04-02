import { useState } from "react";

interface ColumnState {
  [key: string]: {
    id: string;
    title: string;
    tasks: any[];
    wipLimit: number;
    columnId?: number; // Store the actual database ID
  };
}

export function useColumn() {
  const [columns, setColumns] = useState<ColumnState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  return {
    columns,
    setColumns,
    columnOrder,
    setColumnOrder,
  };
}
