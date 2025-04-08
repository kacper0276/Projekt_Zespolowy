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

interface Board {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const { user: currentUser } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get("email");

  const [profileUser, setProfileUser] = useState<IUser | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"info" | "boards">("info");
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [kanbanBoards, setKanbanBoards] = useState<IKanban[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const api = useApiJson();

  // Dummy data for demonstration
  const dummyBio =
    "Passionate about design and creativity. I love to create new boards and share ideas with others.";
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
      // if (usersLoaded) return; // Prevent fetching if already loaded

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
        toast.error("Failed to fetch users list");
      }
    };

    fetchUserData();
  }, []);

  const fetchKanbanBoards = async () => {
    if (!currentUser) return;

    try {
      const { data } = await api.get<ApiResponse<IKanban[]>>("kanban/user", {
        params: { email: currentUser.email },
      });
      setKanbanBoards(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch kanban boards:", error);
      toast.error("Failed to fetch kanban boards");
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    toast.success(
      isFollowing ? "Unfollowed successfully" : "Followed successfully"
    );
  };

  // Handle creating a new board
  const handleCreateBoard = () => {
    navigate("/boards/new");
    toast.info("Creating a new board...");
  };

  useEffect(() => {
    if (!isOwnProfile && activeTab === "boards") {
      setActiveTab("info");
    }
  }, [isOwnProfile, activeTab]);

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
            alt="Profile"
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
            Status:{" "}
            {profileUser.isOnline ? (
              <span className={styles.activeStatus}>Active</span>
            ) : (
              <span className={styles.inactiveStatus}>Inactive</span>
            )}
          </p>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "info" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("info")}
        >
          Information
        </button>
        {isOwnProfile && (
          <button
            className={`${styles.tabButton} ${
              activeTab === "boards" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("boards")}
          >
            Moje Tablice
          </button>
        )}
      </div>

      <div className={styles.contentContainer}>
        {activeTab === "info" && (
          <div className={styles.infoTab}>
            <h2>About</h2>
            <p className={styles.bio}>{dummyBio}</p>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {kanbanBoards.length || userBoards.length}
                </span>
                <span className={styles.statLabel}>Boards</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{100}</span>
                <span className={styles.statLabel}>Followers</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{20}</span>
                <span className={styles.statLabel}>Following</span>
              </div>
            </div>
            {!isOwnProfile && (
              <button
                className={styles.followButton}
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        )}

        {activeTab === "boards" && isOwnProfile && (
          <div className={styles.boardsTab}>
            <h2>Moje Tablice</h2>
            <div className={styles.newBoardOption}>
              <button
                className={styles.newBoardBtn}
                onClick={handleCreateBoard}
              >
                + Utwórz nową tablicę
              </button>
            </div>
            <div className={styles.boardsGrid}>
              {kanbanBoards.length > 0 ? (
                kanbanBoards.map((board) => (
                  <div key={board.id} className={styles.boardCard}>
                    <h3>{board.tableName}</h3>
                    <div className={styles.boardMeta}>
                      <span>{board.users?.length || 0} uczestników</span>
                      <a
                        href={`/boards/${board.id}`}
                        className={styles.viewBoardBtn}
                      >
                        Otwórz
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noBoards}>Nie znaleziono tablic</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
