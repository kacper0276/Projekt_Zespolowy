import React, { useState } from 'react';
import styles from './KanbanBoard.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface Task {
  id: string;
  title: string;
  status: string;
}

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<string[]>(['todo', 'inProgress', 'done']);
  const [newColumnTitle, setNewColumnTitle] = useState<string>('');
  
  // Stany do obsługi dodawania zadań w konkretnej kolumnie
  const [taskInputStates, setTaskInputStates] = useState<{[key: string]: { isAdding: boolean, title: string }}>({});

  // Funkcja do toggleowania widoczności pola dodawania zadania
  const toggleAddTask = (status: string) => {
    setTaskInputStates(prev => ({
      ...prev,
      [status]: {
        isAdding: !(prev[status]?.isAdding || false),
        title: prev[status]?.title || ''
      }
    }));
  };

  // Funkcja do aktualizacji tytułu nowego zadania
  const handleTaskTitleChange = (status: string, title: string) => {
    setTaskInputStates(prev => ({
      ...prev,
      [status]: { 
        isAdding: true, 
        title: title 
      }
    }));
  };

  // Funkcja do dodawania nowego zadania
  const addTask = (status: string) => {
    const titleToAdd = taskInputStates[status]?.title.trim();
    if (titleToAdd) {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: titleToAdd,
        status: status
      };
      
      // Dodaj zadanie do listy zadań
      setTasks(prev => [...prev, newTask]);
      
      // Resetuj stan dodawania zadania dla danej kolumny
      setTaskInputStates(prev => ({
        ...prev,
        [status]: { isAdding: false, title: '' }
      }));
    }
  };

  // Funkcja do dodawania nowej kolumny
  const addColumn = () => {
    if (newColumnTitle.trim() && !columns.includes(newColumnTitle.trim().toLowerCase())) {
      const normalizedColumnName = newColumnTitle.trim().toLowerCase();
      setColumns([...columns, normalizedColumnName]);
      setNewColumnTitle('');
    }
  };

  // Funkcja do przesuwania zadań między kolumnami
  const moveTask = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? {...task, status: newStatus} : task
    ));
  };

  // Renderowanie pojedynczej kolumny
  const renderColumn = (status: string) => {
    const columnTasks = tasks.filter(task => task.status === status);
    const isAddingTask = taskInputStates[status]?.isAdding;
    const currentTaskTitle = taskInputStates[status]?.title || '';

    return (
      <div key={status} className={styles.kanbanColumn}>
        <div className={styles.columnHeader}>
          <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
          <span className={styles.taskCount}>{columnTasks.length}</span>
        </div>
        <div className={styles.columnActions}>
          <button 
            onClick={() => toggleAddTask(status)}
            className={styles.addTaskButton}
          >
            <i className="bi bi-plus"></i> Dodaj zadanie
          </button>
        </div>

        {/* Pole do dodawania zadania */}
        {isAddingTask && (
          <div className={styles.inlineTaskInput}>
            <input 
              type="text"
              value={currentTaskTitle}
              onChange={(e) => handleTaskTitleChange(status, e.target.value)}
              placeholder="Wpisz tytuł zadania"
              className={styles.taskInput}
            />
            <div className={styles.confirmTaskActions}>
              <button 
                onClick={() => addTask(status)}
                className={styles.confirmTaskButton}
                disabled={!currentTaskTitle.trim()}
              >
                Dodaj
              </button>
              <button 
                onClick={() => toggleAddTask(status)}
                className={styles.cancelButton}
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        <div className={styles.columnContent}>
          {columnTasks.map(task => (
            <div key={task.id} className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <h4>{task.title}</h4>
                <div className={styles.taskActions}>
                  {columns.indexOf(status) > 0 && (
                    <button
                      onClick={() => moveTask(task.id, columns[columns.indexOf(status) - 1])}
                      className={styles.moveButton}
                    >
                      <i className="bi bi-arrow-left"></i>
                    </button>
                  )}
                  {columns.indexOf(status) < columns.length - 1 && (
                    <button
                      onClick={() => moveTask(task.id, columns[columns.indexOf(status) + 1])}
                      className={styles.moveButton}
                    >
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.kanbanBoard}>
      <div className={styles.boardHeader}>
        <h1>Tablica projektowa</h1>
      </div>

      <div className={styles.boardContainer}>
        <div className={styles.boardColumns}>
          {columns.map(column => renderColumn(column))}
          
          <div className={styles.columnCreation}>
            <input 
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Nazwa nowej kolumny"
              className={styles.columnInput}
            />
            <button 
              onClick={addColumn}
              className={styles.addColumnButton}
            >
              <i className="bi bi-plus"></i> Dodaj kolumnę
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;