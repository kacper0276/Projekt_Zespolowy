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
import ChatModal from "../../components/ChatModal/ChatModal";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const params = useParams();
  const api = useApiJson();
  const [users, setUsers] = useState<IUser[]>([]);
  const [settings, setSettings] = useState<IKanbanSettings[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editWipValue, setEditWipValue] = useState<number>(0);
  const [updatingWip, setUpdatingWip] = useState<boolean>(false);
  const [userTaskCounts, setUserTaskCounts] = useState<Record<number, number>>(
    {}
  );
  const [remainingAssignments, setRemainingAssignments] = useState<
    Record<number, number>
  >({});
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isUsersSectionCollapsed, setIsUsersSectionCollapsed] =
    useState<boolean>(false);

  const toggleUsersSection = () => {
    setIsUsersSectionCollapsed(!isUsersSectionCollapsed);
  };

  const openChatModal = () => {
    setIsChatModalOpen(true);
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
  };

  // Function to get initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Update user task count
  const updateUserTaskCount = (userId: number, increment: boolean) => {
    setUserTaskCounts((prevCounts) => {
      const currentCount = prevCounts[userId] || 0;
      const newCount = increment
        ? currentCount + 1
        : Math.max(0, currentCount - 1);

      // Update remaining assignments
      updateRemainingAssignments(userId, newCount);

      return {
        ...prevCounts,
        [userId]: newCount,
      };
    });
  };

  // Update remaining assignments based on WIP limit
  const updateRemainingAssignments = (
    userId: number,
    currentTaskCount?: number
  ) => {
    setRemainingAssignments((prevRemaining) => {
      const wipLimit = getUserWipLimit(userId);
      const taskCount =
        currentTaskCount !== undefined
          ? currentTaskCount
          : userTaskCounts[userId] || 0;
      const remaining = wipLimit > 0 ? Math.max(0, wipLimit - taskCount) : 999; // Use high number for unlimited

      return {
        ...prevRemaining,
        [userId]: remaining,
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
          res.data.data.tasks.forEach((task) => {
            if (task.users) {
              task.users.forEach((user) => {
                initialCounts[user.id] = (initialCounts[user.id] || 0) + 1;
              });
            }
          });
        }

        setUserTaskCounts(initialCounts);

        // Initialize remaining assignments based on WIP limits
        const initialRemaining: Record<number, number> = {};
        (res.data.data?.users ?? []).forEach((user) => {
          const userSetting = (res.data.data?.kanbanSettings ?? []).find(
            (s) => s.user.id === user.id
          );
          const wipLimit = userSetting?.wipLimit ?? 0;
          const taskCount = initialCounts[user.id] || 0;
          initialRemaining[user.id] =
            wipLimit > 0 ? Math.max(0, wipLimit - taskCount) : 999; // Use high number for unlimited
        });

        setRemainingAssignments(initialRemaining);
      })
      .catch((_err) => {
        toast.error(t("error-fetching-users"));
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
      remainingAssignments: remainingAssignments[user.id],
    };

    e.dataTransfer.setData(
      "application/json",
      JSON.stringify(userWithRemaining)
    );
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
      toast.error(t("WIP-limit-cannot-be-negative"));
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

        toast.success(t("WIP-limit-updated-successfully"));
        cancelEditing();
      })
      .catch(() => {
        toast.error(t("failed-to-update-WIP-limit"));
      })
      .finally(() => {
        setUpdatingWip(false);
      });
  };

  const handleWipInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    userId: number
  ) => {
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
      <div className={styles.sidebar}>
        {/* Title Section */}
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>{t("kanban-board")}</h3>
        </div>

        {/* ChatButton */}
        <button className={styles.chatButton} onClick={openChatModal}>
          <i className="bi bi-chat-dots"></i>
          <span>{t("open-chat")}</span>
        </button>

        {/* Users Section Header */}
        <div className={styles.sectionHeader} onClick={toggleUsersSection}>
          <div className={styles.sectionTitleRow}>
            <h4 className={styles.sectionTitle}>{t("users")}</h4>
            <i
              className={`bi ${
                isUsersSectionCollapsed ? "bi-chevron-down" : "bi-chevron-up"
              }`}
            ></i>
          </div>
          {!isUsersSectionCollapsed && (
            <p className={styles.dragHint}>{t("drag-hint")}</p>
          )}
        </div>

        {/* Users Section */}
        <div
          className={`${styles.usersSection} ${
            isUsersSectionCollapsed ? styles.collapsed : ""
          }`}
        >
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
                    className={`${styles.userCircle} ${
                      noRemaining ? styles.disabled : ""
                    }`}
                    draggable={!noRemaining}
                    onDragStart={(e) => handleDragStart(e, user)}
                    title={
                      noRemaining
                        ? `${user.firstName} ${user.lastName} ${t(
                            "has-reached-WIP-limit"
                          )} (${wipLimit})`
                        : `${t("drag-to-assign")} ${user.firstName} ${
                            user.lastName
                          } ${t("to-a-task")}`
                    }
                  >
                    <div
                      className={`${styles.avatarCircle} ${
                        noRemaining ? styles.limitReached : ""
                      }`}
                    >
                      {getInitials(user.firstName ?? "", user.lastName ?? "")}
                    </div>
                    <div className={styles.userDetails}>
                      <span className={styles.userName}>
                        {user.firstName} {user.lastName}
                      </span>

                      {editingUserId === user.id ? (
                        <div className={styles.wipEditor}>
                          <label className={styles.wipLabel}>
                            {t("WIP-limit")}:
                          </label>
                          <input
                            type="number"
                            className={styles.wipInput}
                            value={editWipValue || ""}
                            onChange={(e) => {
                              const newValue =
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value);
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
                              {updatingWip ? (
                                <Spinner />
                              ) : (
                                <i className="bi bi-check"></i>
                              )}
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
                                {t("tasks")}:{" "}
                                <strong>
                                  {taskCount} / {wipLimit}
                                </strong>
                                {remaining > 0 && (
                                  <span className={styles.remainingBadge}>
                                    {" "}
                                    ({remaining} left)
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span>{t("WIP-limit-unlimited")}</span>
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
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {isChatModalOpen && (
        <ChatModal
          onClose={closeChatModal}
          isOpen={isChatModalOpen}
          kanbanId={params.id ?? ""}
        />
      )}

      {/* Export context for other components to use */}
      <AssignedUsersContext.Provider
        value={{
          assignedUsers: users,
          setAssignedUsers: setUsers,
          userTaskCounts,
          updateUserTaskCount,
          remainingAssignments,
        }}
      />
    </div>
  );
};

export default Sidebar;
