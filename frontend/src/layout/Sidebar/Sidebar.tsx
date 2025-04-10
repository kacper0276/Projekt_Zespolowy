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
}>({
  assignedUsers: [],
  setAssignedUsers: () => {},
});

export const useAssignedUsers = () => useContext(AssignedUsersContext);

const Sidebar = () => {
  const params = useParams();
  const api = useApiJson();
  const [isMinimized, setIsMinimized] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [settings, setSettings] = useState<IKanbanSettings[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Function to get initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };
  

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiResponse<IKanban>>(`kanban/board/${params.id}`)
      .then((res) => {
        setUsers(res.data.data?.users ?? []);
        setSettings(res.data.data?.kanbanSettings ?? []);
      })
      .catch((_err) => {
        toast.error("error-fetching-users");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params]);
  
  const handleDragStart = (e: React.DragEvent, user: IUser) => {
    e.dataTransfer.setData('application/json', JSON.stringify(user));
    e.dataTransfer.effectAllowed = 'copy';
    
    const dragImage = document.createElement('div');
    dragImage.className = styles.dragImage;
    dragImage.textContent = getInitials(user.firstName ?? "", user.lastName ?? "");
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 15, 15);

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
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
          <p className={styles.dragHint}>{isMinimized ? "" : "Drag users to tasks to assign them"}</p>
        </div>
        {/* Users Section */}
        <div className={styles.usersSection}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className={`${styles.userCircle}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, user)}
                  title={`Drag to assign ${user.firstName} ${user.lastName} to a task`}
                >
                  <div className={styles.avatarCircle}>
                    {getInitials(user.firstName ?? "", user.lastName ?? "")}
                  </div>
                  {!isMinimized && (
                    <>
                      <span className={styles.userName}>
                        {user.firstName} {user.lastName} (
                        {settings.find((setting) => setting.user.id === user.id)
                          ?.wipLimit ?? 0}
                        )
                      </span>
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;