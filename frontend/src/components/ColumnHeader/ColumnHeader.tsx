import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import styles from '../../pages/KanbanBoard/KanbanBoard.module.scss';
import WipLimitEditor from '../../components/WipLimitEditor/WipLimitEditor';
import ActionButton from '../../components/ActionButton/ActionButton';

interface Column {
  id: string;
  title: string;
  wipLimit: number;
}

interface ColumnHeaderProps {
  columns: Record<string, Column>;
  columnOrder: string[];
  countTasksInColumn: (columnId: string) => number;
  isEditingWipLimitMap: Record<string, boolean>;
  handleWipLimitSave: (columnId: string, limit: number) => void;
  handleStartEditingWipLimit: (columnId: string) => void;
  handleCancelEditingWipLimit: (columnId: string) => void;
  deleteColumn: (columnId: string) => void;
  newColumnTitle: string;
  setNewColumnTitle: (title: string) => void;
  addColumn: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ 
  columns, 
  columnOrder, 
  countTasksInColumn, 
  isEditingWipLimitMap, 
  handleWipLimitSave, 
  handleStartEditingWipLimit, 
  handleCancelEditingWipLimit,
  deleteColumn,
  newColumnTitle,
  setNewColumnTitle,
  addColumn
}) => {
  return (
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
                        
                        {!["todo", "inprogress", "done"].includes(column.id) && (
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
  );
};

export default ColumnHeader;