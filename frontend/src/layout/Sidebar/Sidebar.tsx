import { useEffect, useState } from "react";
import styles from "./Sidebar.module.scss";
import { useParams } from "react-router-dom";
import { useApiJson } from "../../config/api";
import { IUser } from "../../interfaces/IUser";
import { ApiResponse } from "../../types/api.types";
import { IKanban } from "../../interfaces/IKanban";
import Spinner from "../../components/Spinner/Spinner";
import { toast } from "react-toastify";
import { IKanbanSettings } from "../../interfaces/IKanbanSettings";

import React, { createContext, useContext } from "react";

export const AssignedUsersContext = createContext<{
  assignedUsers: IUser[];
  setAssignedUsers: React.Dispatch<React.SetStateAction<IUser[]>>;
  userTaskCounts: Record<number, number>;
  updateUserTaskCount: (userId: number, increment: boolean) => void;
  remainingAssignments: Record<number, number>;
}>({
  assignedUsers: [],
  setAssignedUsers: () => {},
  userTaskCounts: {},
  updateUserTaskCount: () => {},
  remainingAssignments: {},
});

export const useAssignedUsers = () => useContext(AssignedUsersContext);

const Sidebar = () => {
  const params = useParams();
  const api = useApiJson();
  const [isMinimized, setIsMinimized] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [settings, setSettings] = useState<IKanbanSettings[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editWipValue, setEditWipValue] = useState<number>(0);
  const [updatingWip, setUpdatingWip] = useState<boolean>(false);
  // Track how many tasks each user is currently assigned to
  const [userTaskCounts, setUserTaskCounts] = useState<Record<number, number>>({});
  // Track how many more assignments each user can have
  const [remainingAssignments, setRemainingAssignments] = useState<Record<number, number>>({});

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  // Function to get initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Update user task count
  const updateUserTaskCount = (userId: number, increment: boolean) => {
    setUserTaskCounts(prevCounts => {
      const currentCount = prevCounts[userId] || 0;
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
      
      // Update remaining assignments
      updateRemainingAssignments(userId, newCount);
      
      return {
        ...prevCounts,
        [userId]: newCount
      };
    });
  };
  
  // Update remaining assignments based on WIP limit
  const updateRemainingAssignments = (userId: number, currentTaskCount?: number) => {
    setRemainingAssignments(prevRemaining => {
      const wipLimit = getUserWipLimit(userId);
      const taskCount = currentTaskCount !== undefined ? currentTaskCount : userTaskCounts[userId] || 0;
      const remaining = wipLimit > 0 ? Math.max(0, wipLimit - taskCount) : 999; // Use high number for unlimited
      
      return {
        ...prevRemaining,
        [userId]: remaining
      };
    });
  };

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiResponse<IKanban>>(`kanban/board/${params.id}`)
      .then((res) => {
        setUsers(res.data.data?.users ?? []);
        setSettings(res.data.data?.kanbanSettings ?? []);
        
        // Initialize task counts
        const initialCounts: Record<number, number> = {};
        
        // If tasks are available in the response, count assignments
        if (res.data.data?.tasks) {
          res.data.data.tasks.forEach(task => {
            if (task.users) {
              task.users.forEach(user => {
                initialCounts[user.id] = (initialCounts[user.id] || 0) + 1;
              });
            }
          });
        }
        
        setUserTaskCounts(initialCounts);
        
        // Initialize remaining assignments based on WIP limits
        const initialRemaining: Record<number, number> = {};
        (res.data.data?.users ?? []).forEach(user => {
          const userSetting = (res.data.data?.kanbanSettings ?? []).find(s => s.user.id === user.id);
          const wipLimit = userSetting?.wipLimit ?? 0;
          const taskCount = initialCounts[user.id] || 0;
          initialRemaining[user.id] = wipLimit > 0 ? Math.max(0, wipLimit - taskCount) : 999; // Use high number for unlimited
        });
        
        setRemainingAssignments(initialRemaining);
      })
      .catch((_err) => {
        toast.error("error-fetching-users");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params]);

  const handleDragStart = (e: React.DragEvent, user: IUser) => {
    // Check if user has any remaining assignments
    if (remainingAssignments[user.id] <= 0) {
      e.preventDefault();
      return;
    }

    // Add metadata about remaining assignments
    const userWithRemaining = {
      ...user,
      remainingAssignments: remainingAssignments[user.id]
    };

    e.dataTransfer.setData("application/json", JSON.stringify(userWithRemaining));
    e.dataTransfer.effectAllowed = "copy";

    const dragImage = document.createElement("div");
    dragImage.className = styles.dragImage;
    dragImage.textContent = getInitials(
      user.firstName ?? "",
      user.lastName ?? ""
    );
    document.body.appendChild(dragImage);

    e.dataTransfer.setDragImage(dragImage, 15, 15);

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const startEditing = (userId: number) => {
    const userSetting = settings.find((setting) => setting.user.id === userId);
    setEditingUserId(userId);
    setEditWipValue(userSetting?.wipLimit ?? 0);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditWipValue(0);
  };

  const saveWipLimit = (userId: number) => {
    if (editWipValue < 0) {
      toast.error("WIP limit cannot be negative");
      return;
    }

    setUpdatingWip(true);
    api
      .put(`kanban-settings/${userId}/${params.id}/edit-wip-limit`, {
        newWipLimit: editWipValue,
      })
      .then(() => {
        // Update local state
        const updatedSettings = settings.map((setting) => {
          if (setting.user.id === userId) {
            return { ...setting, wipLimit: editWipValue };
          }
          return setting;
        });
        setSettings(updatedSettings);
        
        // Update remaining assignments based on new WIP limit
        updateRemainingAssignments(userId);
        
        toast.success("WIP limit updated successfully");
        cancelEditing();
      })
      .catch(() => {
        toast.error("Failed to update WIP limit");
      })
      .finally(() => {
        setUpdatingWip(false);
      });
  };

  const handleWipInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, userId: number) => {
    if (e.key === "Enter") {
      saveWipLimit(userId);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const getUserWipLimit = (userId: number) => {
    const userSetting = settings.find((setting) => setting.user.id === userId);
    return userSetting?.wipLimit ?? 0;
  };

  // Check if user has no remaining assignments
  const hasNoRemainingAssignments = (userId: number) => {
    return remainingAssignments[userId] <= 0;
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${isMinimized ? styles.minimized : ""}`}
      >
        {/* Toggle Button */}
        <div className={styles.toggleButton} onClick={toggleSidebar}>
          <i
            className={`bi ${
              isMinimized ? "bi-chevron-right" : "bi-chevron-left"
            }`}
          ></i>
        </div>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>{isMinimized ? "" : "Users"}</h3>
          <p className={styles.dragHint}>
            {isMinimized ? "" : "Drag users to tasks to assign them"}
          </p>
        </div>
        {/* Users Section */}
        <div className={styles.usersSection}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              {users.map((user) => {
                const noRemaining = hasNoRemainingAssignments(user.id);
                const wipLimit = getUserWipLimit(user.id);
                const taskCount = userTaskCounts[user.id] || 0;
                const remaining = remainingAssignments[user.id] || 0;
                
                return (
                  <div
                    key={user.id}
                    className={`${styles.userCircle} ${noRemaining ? styles.disabled : ""}`}
                    draggable={!noRemaining}
                    onDragStart={(e) => handleDragStart(e, user)}
                    title={noRemaining 
                      ? `${user.firstName} ${user.lastName} has reached WIP limit (${wipLimit})`
                      : `Drag to assign ${user.firstName} ${user.lastName} to a task`
                    }
                  >
                    <div className={`${styles.avatarCircle} ${noRemaining ? styles.limitReached : ""}`}>
                      {getInitials(user.firstName ?? "", user.lastName ?? "")}
                    </div>
                    {!isMinimized && (
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>
                          {user.firstName} {user.lastName}
                        </span>
                        
                        {editingUserId === user.id ? (
                          <div className={styles.wipEditor}>
                            <label className={styles.wipLabel}>WIP Limit:</label>
                            <input
                              type="number"
                              className={styles.wipInput}
                              value={editWipValue || ""}
                              onChange={(e) => {
                                const newValue = e.target.value === "" ? 0 : parseInt(e.target.value);
                                setEditWipValue(newValue);
                              }}
                              onKeyDown={(e) => handleWipInputKeyDown(e, user.id)}
                              min="0"
                              autoFocus
                              placeholder="0"
                            />
                            <div className={styles.wipActions}>
                              <button 
                                className={`${styles.wipButton} ${styles.saveButton}`}
                                onClick={() => saveWipLimit(user.id)}
                                disabled={updatingWip}
                              >
                                {updatingWip ? <Spinner /> : <i className="bi bi-check"></i>}
                              </button>
                              <button 
                                className={`${styles.wipButton} ${styles.cancelButton}`}
                                onClick={cancelEditing}
                                disabled={updatingWip}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.wipDisplay}>
                            <span className={styles.wipValue}>
                              {wipLimit > 0 ? (
                                <span>
                                  Tasks: <strong>{taskCount} / {wipLimit}</strong>
                                  {remaining > 0 && <span className={styles.remainingBadge}> ({remaining} left)</span>}
                                </span>
                              ) : (
                                <span>WIP Limit: Unlimited</span>
                              )}
                            </span>
                            <button 
                              className={styles.editButton}
                              onClick={() => startEditing(user.id)}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      
      {/* Export context for other components to use */}
      <AssignedUsersContext.Provider
        value={{
          assignedUsers: users,
          setAssignedUsers: setUsers,
          userTaskCounts,
          updateUserTaskCount,
          remainingAssignments
        }}
      />
    </div>
  );
};

export default Sidebar;