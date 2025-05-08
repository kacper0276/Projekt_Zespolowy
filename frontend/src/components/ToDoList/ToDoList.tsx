import React, { useEffect, useState } from "react";
import { IToDoItem } from "../../interfaces/IToDoItem";
import { IToDoList } from "../../interfaces/IToDoList";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import styles from "./ToDoList.module.scss";
import { useTranslation } from "react-i18next";
interface ItemProps {
  taskId: number | string;
}

const ToDoList: React.FC<ItemProps> = ({ taskId }) => {
  const { t } = useTranslation();
  const api = useApiJson();
  const [todoLists, setTodoLists] = useState<IToDoList[]>([]);
  const [newListName, setNewListName] = useState<string>("");
  const [newItemName, setNewItemName] = useState<string>("");
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchTodoLists();
  }, [taskId]);

  const fetchTodoLists = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<IToDoList[]>>(
        `to-do-lists/task/${taskId}`
      );
      const lists = response.data.data || [];
      setTodoLists(lists);
      
      // Set active list if exists
      if (lists.length > 0) {
        setActiveListId(lists[0].id || null);
      }
    } catch (error) {
      console.error(t("error-fetching-todo-lists"), error);
    } finally {
      setIsLoading(false);
    }
  };

  const createToDoList = async () => {
    if (!newListName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<ApiResponse<IToDoList>>(
        `to-do-lists/${taskId}`,
        {
          name: newListName,
        }
      );
      
      if (response.data.data) {
        setTodoLists([...todoLists, response.data.data]);
        setActiveListId(response.data.data.id || null);
      }
      
      setNewListName("");
    } catch (error) {
      console.error(t("error-creating-todo-list"), error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToDoItem = async () => {
    if (!activeListId || !newItemName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<ApiResponse<IToDoItem>>(
        `to-do-lists/${activeListId}/items`,
        {
          name: newItemName,
          isDone: false
        }
      );
      
      if (response.data.data) {
        // Update the specific list with the new item
        const updatedLists = todoLists.map(list => {
          if (list.id === activeListId) {
            return {
              ...list,
              items: [...(list.items || []), response.data.data as IToDoItem]
            };
          }
          return list;
        });
        
        setTodoLists(updatedLists);
      }
      
      setNewItemName("");
    } catch (error) {
      console.error(t("error-adding-todo-item"), error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemStatus = async (listId: number, itemId: number, currentStatus: boolean) => {
    try {
      await api.patch(`to-do-lists/${listId}/items/${itemId}`, {
        isDone: !currentStatus
      });
      
      // Update local state
      const updatedLists = todoLists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: (list.items || []).map(item => 
              item.id === itemId ? { ...item, isDone: !currentStatus } : item
            )
          };
        }
        return list;
      });
      
      setTodoLists(updatedLists);
    } catch (error) {
      console.error("Error toggling item status:", error);
    }
  };

  const deleteItem = async (listId: number, itemId: number) => {
    try {
      await api.delete(`to-do-lists/${listId}/items/${itemId}`);
      
      // Update local state
      const updatedLists = todoLists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: (list.items || []).filter(item => item.id !== itemId)
          };
        }
        return list;
      });
      
      setTodoLists(updatedLists);
    } catch (error) {
      console.error(t("error-deleting-item"), error);
    }
  };

  const deleteList = async (listId: number) => {
    if (!window.confirm(t('confirm-delete-list'))) {
      return;
    }
    
    try {
      await api.delete(`to-do-lists/${listId}`);
      
      // Update local state
      const updatedLists = todoLists.filter(list => list.id !== listId);
      setTodoLists(updatedLists);
      
      // Set new active list if needed
      if (activeListId === listId) {
        setActiveListId(updatedLists.length > 0 ? updatedLists[0].id || null : null);
      }
    } catch (error) {
      console.error(t("error-deleting-list"), error);
    }
  };

  return (
    <div className={styles.todoListContainer}>
      <div className={styles.todoListHeader}>
        <h3>{t("task-list")} ({todoLists.length})</h3>
        
        <div className={styles.createListForm}>
          <input
            type="text"
            placeholder={t("new-list-name")}
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className={styles.inputField}
          />
          <button 
            onClick={createToDoList} 
            disabled={isLoading || !newListName.trim()}
            className={styles.actionButton}
          >
            <i className="bi bi-plus-circle"></i> {t("create")}
          </button>
        </div>
      </div>

      {todoLists.length > 0 ? (
        <div className={styles.listsContainer}>
          <div className={styles.listsTabs}>
            {todoLists.map((list) => (
              <div 
                key={list.id} 
                className={`${styles.listTab} ${activeListId === list.id ? styles.activeTab : ''}`}
                onClick={() => setActiveListId(list.id || null)}
              >
                <span>{list.name}</span>
                <span className={styles.itemCount}>
                  {(list.items || []).length} {t("tasks-countable")}
                </span>
                <button 
                  className={styles.deleteListButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    list.id && deleteList(list.id);
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))}
          </div>
          
          {activeListId && (
            <div className={styles.listContent}>
              <div className={styles.addItemForm}>
                <input
                  type="text"
                  placeholder={t("new-task")}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className={styles.inputField}
                />
                <button 
                  onClick={addToDoItem} 
                  disabled={isLoading || !newItemName.trim()}
                  className={styles.actionButton}
                >
                  <i className="bi bi-plus"></i> {t("add")}
                </button>
              </div>
              
              <ul className={styles.itemsList}>
                {todoLists
                  .find(list => list.id === activeListId)
                  ?.items?.map((item) => (
                    <li key={item.id} className={styles.todoItem}>
                      <div 
                        className={`${styles.todoCheckbox} ${item.isDone ? styles.checked : ''}`}
                        onClick={() => item.id && activeListId && toggleItemStatus(activeListId, item.id, !!item.isDone)}
                      >
                        <i className={`bi ${item.isDone ? 'bi-check-square' : 'bi-square'}`}></i>
                      </div>
                      <span className={`${styles.todoItemText} ${item.isDone ? styles.completed : ''}`}>
                        {item.name}
                      </span>
                      <button 
                        className={styles.deleteItemButton}
                        onClick={() => item.id && activeListId && deleteItem(activeListId, item.id)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </li>
                  )) || (
                    <li className={styles.emptyMessage}>
                      {t("this-list-contains-no-tasks-yet")}
                    </li>
                  )
                }
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>{t("no-task-list-for-this-task")}</p>
          <p>{t("create-first-list-using-the-form-above")}</p>
        </div>
      )}
    </div>
  );
};

export default ToDoList;