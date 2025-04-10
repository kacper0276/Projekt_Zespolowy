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

const Sidebar = () => {
  const params = useParams();
  const api = useApiJson();
  const [isMinimized, setIsMinimized] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [settings, setSettings] = useState<IKanbanSettings[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Dummy users data
  // const users = [
  //   { id: 1, firstName: "John", lastName: "Doe" },
  //   { id: 2, firstName: "Sarah", lastName: "Parker" },
  //   { id: 3, firstName: "Mike", lastName: "Johnson" },
  //   { id: 4, firstName: "Anna", lastName: "Brown" },
  //   { id: 5, firstName: "Tom", lastName: "Wilson" },
  // ];

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
        </div>

        {/* Users Section */}
        <div className={styles.usersSection}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              {users.map((user) => (
                <div key={user.id} className={styles.userCircle}>
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
