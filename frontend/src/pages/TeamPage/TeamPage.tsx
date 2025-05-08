import React, { useEffect, useState } from "react";
import styles from "./TeamPage.module.scss";
import { ITeam } from "../../interfaces/ITeam";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useApiJson } from "../../config/api";
import { useUser } from "../../context/UserContext";
import { ApiResponse } from "../../types/api.types";
import PopUp from "../../components/PopUp/PopUp";
import { IUser } from "../../interfaces/IUser";
import Multiselect from "multiselect-react-dropdown";
import { ITeamInvite } from "../../interfaces/ITeamInvite";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner/Spinner";
import { useTranslation } from "react-i18next";


const TeamPage: React.FC = () => {
  const { t } = useTranslation();
  useWebsiteTitle(t("your-teams"));
  const api = useApiJson();
  const userContext = useUser();
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [team, setTeam] = useState<{
    teamName: string;
    users: IUser[];
    invitedBy: IUser | null;
  }>({ users: [], teamName: "", invitedBy: null });
  const [teamInvites, setTeamInvites] = useState<ITeamInvite[]>([]);
  const [activeTab, setActiveTab] = useState<"teams" | "invites">("teams");

  const toggleAddTeamClick = () => {
    setShowAddTeamModal(!showAddTeamModal);
  };

  const onSelect = (selectedList: IUser[], _selectedItem: IUser) => {
    setTeam({ ...team, users: selectedList });
  };

  const onRemove = (selectedList: IUser[], _removedItem: IUser) => {
    setTeam({ ...team, users: selectedList });
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<ITeam[]>>(
        `teams/user/${userContext?.user?.id}`
      );
      setTeams(response.data.data ?? []);
    } catch (error) {
      toast.error(t(`error-fetching-teams`));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (
    inviteId: number,
    action: "accept" | "reject"
  ) => {
    if (inviteId === -1) return;

    setLoading(true);
    try {
      await api.post<ApiResponse<ITeamInvite>>(
        `teams/invites/${inviteId}/respond`,
        {
          userId: userContext?.user?.id,
          action,
        }
      );

      const response = await api.get<ApiResponse<ITeamInvite[]>>(
        `teams/invites/${userContext?.user?.id}`
      );
      setTeamInvites(response.data.data ?? []);
      fetchTeams();

      toast.success(
        t('inviteStatus', {
          status: t(action === 'accept' ? 'accepted' : 'rejected')
        })
      );
    } catch (error) {
      toast.error(t("error-accepting-or-rejecting-invite"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async () => {
    if (!team.teamName.trim()) {
      return;
    }

    setLoading(true);
    try {
      await api.post<ApiResponse<ITeam>>("teams", team);

      // Refresh teams list after adding a new team
      const response = await api.get<ApiResponse<ITeam[]>>(
        `teams/user/${userContext?.user?.id}`
      );
      setTeams(response.data.data ?? []);

      setShowAddTeamModal(false);
    } catch (error) {
      toast.error(t("error-adding-team"));
    } finally {
      setTeam({ ...team, users: [], teamName: "" });
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiResponse<IUser[]>>(`users/all`);
        setUsers(response.data.data ?? []);
      } catch (error) {
        toast.error(t("error-fetching-users"));
      } finally {
        setLoading(false);
      }
    };

    const fetchTeamInvites = async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiResponse<ITeamInvite[]>>(
          `teams/invites/${userContext?.user?.id}`
        );
        setTeamInvites(response.data.data ?? []);
      } catch (error) {
        toast.error(t("error-fetching-team-invites"));
      } finally {
        setLoading(false);
      }
    };

    setTeam({ ...team, invitedBy: userContext?.user ?? null });

    fetchTeams();
    fetchUsers();
    fetchTeamInvites();
  }, []);

  return (
    <div className={styles.teamPage}>
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "teams" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("teams")}
        >
          {t("teams")}
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "invites" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("invites")}
        >
          {t("invites")}
          {teamInvites.length > 0 && (
            <span className={styles.badgeCount}>{teamInvites.length}</span>
          )}
        </button>
      </div>

      {activeTab === "invites" && (
        <div className={styles.contentSection}>
          <div className={styles.sectionHeaderContainer}>
            <h2>{t("your-invites")}</h2>
          </div>

          {loading ? (
            <div className={styles.spinnerContainer}>
              <Spinner />
            </div>
          ) : (
            <div className={styles.itemsList}>
              {teamInvites.length > 0 ? (
                teamInvites.map((invite) => (
                  <div key={invite.id} className={styles.teamCard}>
                    <p>{t("invited-by")}{invite.invitedByUser?.email}</p>
                    <p>{t("to-team")}{invite.team.name}</p>
                    <div className={styles.inviteActions}>
                      <button
                        className={styles.acceptButton}
                        onClick={() =>
                          handleAcceptInvite(invite.id ?? -1, "accept")
                        }
                      >
                        {t("accept")}
                      </button>
                      <button
                        className={styles.rejectButton}
                        onClick={() =>
                          handleAcceptInvite(invite.id ?? -1, "reject")
                        }
                      >
                        {t("reject")}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMessage}>
                  {t("you-do-not-have-any-invites")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "teams" && (
        <div className={styles.contentSection}>
          <div className={styles.headerContainer}>
            <h1>{t("your-teams")}</h1>
            <button
              className={styles.addTeamButton}
              onClick={toggleAddTeamClick}
              aria-label={t("add-a-new-team")}
            >
              +
            </button>
          </div>

          {loading ? (
            <div className={styles.spinnerContainer}>
              <Spinner />
            </div>
          ) : (
            <div className={styles.itemsList}>
              {teams.length > 0 ? (
                teams.map((team) => (
                  <div key={team.id} className={styles.teamCard}>
                    <h2>{team.name}</h2>
                    <p>{t("member-count")} {team.users.length}</p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMessage}>
                  {t("you-do-not-have-any-teams-yet")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {showAddTeamModal && (
        <PopUp
          header={<h2>{t("add-a-new-team")}</h2>}
          body={
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTeam();
              }}
            >
              <div className={styles.formGroup}>
                <label htmlFor="teamName">{t("team-name")}</label>
                <input
                  type="text"
                  id="teamName"
                  value={team.teamName}
                  onChange={(e) =>
                    setTeam({ ...team, teamName: e.target.value })
                  }
                  placeholder={t("enter-team-name")}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="users">{t("users")}</label>
                <Multiselect
                  options={users}
                  displayValue="email"
                  onSelect={onSelect}
                  onRemove={onRemove}
                  placeholder={t("choose-users")}
                  emptyRecordMsg={t("no-users")}
                  loading={loading}
                />
              </div>
            </form>
          }
          footer={
            <>
              <button onClick={toggleAddTeamClick}>{t("cancel")}</button>
              <button onClick={handleAddTeam}>{t("add-team")}</button>
            </>
          }
          onClose={toggleAddTeamClick}
        />
      )}
    </div>
  );
};

export default TeamPage;
