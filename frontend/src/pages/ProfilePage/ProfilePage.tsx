import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IUser } from "../../interfaces/IUser";
import { IKanban } from "../../interfaces/IKanban";
import { toast } from "react-toastify";
import PlaceholderPfP from "../../assets/PlaceholderPictures/PlaceholderPfP.png";
import styles from "./ProfilePage.module.scss";
import { useTranslation } from "react-i18next";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
interface Board {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  useWebsiteTitle(t("my-profile"));
  const { user: currentUser } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get("email");

  const [profileUser, setProfileUser] = useState<IUser | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [, setUserBoards] = useState<Board[]>([]);
  const [kanbanBoards, setKanbanBoards] = useState<IKanban[]>([]);
  const api = useApiJson();

  // Dummy data for demonstration
  const dummyBoards: Board[] = [
    {
      id: 1,
      title: "Project Ideas",
      description: "Collection of project ideas for future development",
      createdAt: "2025-01-15",
    },
    {
      id: 2,
      title: "Travel Inspiration",
      description: "Places I want to visit and travel tips",
      createdAt: "2025-02-03",
    },
    {
      id: 3,
      title: "Design Resources",
      description: "Useful design tools and resources",
      createdAt: "2025-03-10",
    },
  ];

  // Fetch all users only once when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get<ApiResponse<IUser>>(
          `users/by-email?userEmail=${emailParam}`
        );

        if (response.data && response.data.data) {
          setProfileUser(response.data.data);

          if (response.data.data.email === currentUser?.email) {
            setIsOwnProfile(true);
          } else {
            setIsOwnProfile(false);
          }

          setUserBoards(dummyBoards);
          fetchKanbanBoards();
        }
      } catch (error: any) {
        toast.error(t("failed-to-fetch-users-list"));
      }
    };

    fetchUserData();
  }, [emailParam]);

  const fetchKanbanBoards = async () => {
    try {
      const { data } = await api.get<ApiResponse<IKanban[]>>("kanban/user", {
        params: { email: emailParam },
      });
      console.log(data);
      setKanbanBoards(data.data ?? []);
    } catch (error) {
      console.error(t("failed-to-fetch-kanban-boards"), error);
      toast.error("toast-failed-to-fetch-kanban-boards");
    }
  };

  // Handle creating a new board
  const handleCreateBoard = () => {
    navigate("/boards/new");
    toast.info(t("creating-a-new-board"));
  };

  if (!profileUser) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        {/* Placeholder profile image */}
        <div className={styles.profileImage}>
          <img
            src={PlaceholderPfP}
            alt={t("profile")}
            onError={(e) => (e.currentTarget.src = PlaceholderPfP)}
          />
        </div>
        <div className={styles.profileInfo}>
          <h1>
            {profileUser.firstName || "User"}{" "}
            {profileUser.lastName || profileUser.lastName || ""}
          </h1>
          <p className={styles.username}>@{profileUser.login}</p>
          <p className={styles.email}>{profileUser.email}</p>
          <p className={styles.userStatus}>
            {t("user-status")}{" "}
            {profileUser.isOnline ? (
              <span className={styles.activeStatus}>{t("active")}</span>
            ) : (
              <span className={styles.inactiveStatus}>{t("inactive")}</span>
            )}
          </p>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.boardsTab}>
          <h2>{isOwnProfile ? t("my-boards") : t("boards")}</h2>
          {isOwnProfile && (
            <div className={styles.newBoardOption}>
              <button
                className={styles.newBoardBtn}
                onClick={handleCreateBoard}
              >
                + {t("create-new-table")}
              </button>
            </div>
          )}
          <div className={styles.boardsGrid}>
            {kanbanBoards.length > 0 ? (
              kanbanBoards.map((board) => (
                <div key={board.id} className={styles.boardCard}>
                  <h3>{board.tableName}</h3>
                  <div className={styles.boardMeta}>
                    <span>
                      {board.users?.length || 0} {t("members")}
                    </span>
                    {isOwnProfile && (
                      <a
                        href={`/boards/${board.id}`}
                        className={styles.viewBoardBtn}
                      >
                        {t("open")}
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noBoards}>{t("no-boards-found")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
