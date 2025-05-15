import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IUser } from "../../interfaces/IUser";
import { IKanban } from "../../interfaces/IKanban";
import { ITeam } from "../../interfaces/ITeam";
import { toast } from "react-toastify";
import PlaceholderPfP from "../../assets/PlaceholderPictures/PlaceholderPfP.png";
import styles from "./ProfilePage.module.scss";
import { useTranslation } from "react-i18next";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import PopUp from "../../components/PopUp/PopUp";

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

  // Team invitation states
  const [showInviteToTeamModal, setShowInviteToTeamModal] =
    useState<boolean>(false);
  const [userTeams, setUserTeams] = useState<ITeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
            // If not own profile, fetch current user's teams for invitation
            fetchUserTeams();
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

  // Fetch teams that the current user belongs to
  const fetchUserTeams = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    try {
      const response = await api.get<ApiResponse<ITeam[]>>(
        `teams/user/${currentUser.id}`
      );
      setUserTeams(response.data.data ?? []);
    } catch (error) {
      toast.error(t("error-fetching-teams"));
    } finally {
      setLoading(false);
    }
  };

  // Toggle team invitation modal
  const toggleInviteToTeamModal = () => {
    setShowInviteToTeamModal(!showInviteToTeamModal);
    setSelectedTeam(null);
  };

  // Handle team selection
  const handleTeamSelect = (team: ITeam) => {
    if (selectedTeam?.id === team.id) {
      setSelectedTeam(null);
    } else {
      setSelectedTeam(team);
    }
  };

  // Check if user is already a member of the team
  const isUserInTeam = (team: ITeam): boolean => {
    return team.users.some((user) => user.id === profileUser?.id);
  };

  //Dummy function to send invite
  const handleSendInvite = () => {
    if (!selectedTeam || !profileUser) return;

    // Show success message placeholder
    toast.success(t("invite-sent-successfully"));
    toggleInviteToTeamModal();
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
      <div
        className={styles.profileHeader}
        style={
          profileUser.backgroundImage
            ? { backgroundImage: `url(${profileUser.backgroundImage})` }
            : {}
        }
      >
        {/* Placeholder profile image */}
        <div className={styles.profileImage}>
          <img
            src={
              profileUser.profileImage
                ? profileUser.profileImage
                : PlaceholderPfP
            }
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

          {!isOwnProfile && currentUser && (
            <button
              className={styles.inviteToTeamBtn}
              onClick={toggleInviteToTeamModal}
            >
              {t("invite-to-team")}
            </button>
          )}
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

      {/* Team Invitation Modal */}
      {showInviteToTeamModal && (
        <PopUp
          header={<h2>{t("invite-to-team")}</h2>}
          body={
            <div className={styles.inviteModalBody}>
              <p>
                {t("select-team-to-invite", {
                  user: profileUser.login || profileUser.email,
                })}
              </p>

              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loader}></div>
                </div>
              ) : userTeams.length > 0 ? (
                <div className={styles.teamsList}>
                  {userTeams.map((team) => (
                    <div
                      key={team.id}
                      className={`${styles.teamItem} ${
                        selectedTeam?.id === team.id ? styles.selectedTeam : ""
                      }`}
                      onClick={() => handleTeamSelect(team)}
                    >
                      <span className={styles.teamName}>{team.name}</span>
                      <span className={styles.memberCount}>
                        {team.users.length} {t("members")}
                      </span>
                      {isUserInTeam(team) && (
                        <span className={styles.alreadyMember}>
                          {t("already-member")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noTeamsMessage}>
                  {t("you-do-not-have-any-teams-yet")}
                </p>
              )}
            </div>
          }
          footer={
            <>
              <button
                className={styles.cancelButton}
                onClick={toggleInviteToTeamModal}
              >
                {t("cancel")}
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleSendInvite}
                disabled={
                  !selectedTeam || (selectedTeam && isUserInTeam(selectedTeam))
                }
              >
                {t("send-invite")}
              </button>
            </>
          }
          onClose={toggleInviteToTeamModal}
        />
      )}
    </div>
  );
};

export default ProfilePage;
