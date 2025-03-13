import { IUser } from "../interfaces/IUser";

export type TaskData = {
    id: string;
    title: string;
    users: IUser[];
  };
  
  export type ColumnData = {
    id: string;
    title: string;
    tasks: TaskData[];
    uniqueCounter: number;
    wipLimit: number;
  };
  
  export type ColumnsState = {
    [key: string]: ColumnData;
  };
  
  export interface WipLimitProps {
    currentValue: number;
    onChange: (value: number) => void;
    isLimitReached: boolean;
  }