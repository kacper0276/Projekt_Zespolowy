import React, { useEffect, useState } from "react";
import styles from "./TeamPage.module.scss";
import { ITeam } from "../../interfaces/ITeam";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useApiJson } from "../../config/api";
import { useUser } from "../../context/UserContext";
import { ApiResponse } from "../../types/api.types";
import { Spinner } from "react-bootstrap";
import PopUp from "../../components/PopUp/PopUp";
import { IUser } from "../../interfaces/IUser";
import Multiselect from "multiselect-react-dropdown";
import { ITeamInvite } from "../../interfaces/ITeamInvite";
import { toast } from "react-toastify";

const TeamPage: React.FC = () => {
  useWebsiteTitle("Twoje zespoły");
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

  const toggleAddTeamClick = () => {
    setShowAddTeamModal(!showAddTeamModal);
  };

  const onSelect = (selectedList: IUser[], _selectedItem: IUser) => {
    setTeam({ ...team, users: selectedList });
  };

  const onRemove = (selectedList: IUser[], _removedItem: IUser) => {
    setTeam({ ...team, users: selectedList });
  };

  const handleAddTeam = async () => {
    if (!team.teamName.trim()) {
      // Could add validation message here
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
      toast.error("Error adding team");
    } finally {
      setTeam({ ...team, users: [], teamName: "" });
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiResponse<ITeam[]>>(
          `teams/user/${userContext?.user?.id}`
        );
        setTeams(response.data.data ?? []);
      } catch (error) {
        toast.error(`Error fetching teams`);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiResponse<IUser[]>>(`users/all`);
        setUsers(response.data.data ?? []);
      } catch (error) {
        toast.error("Error fetching users:");
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
        toast.error("Error fetching team invites:");
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
      <h2>Twoje zaproszenia</h2>
      {loading ? (
        <Spinner />
      ) : (
        <div className={styles.teamsList}>
          {teamInvites.length > 0 ? (
            teamInvites.map((invite) => (
              <div key={invite.id} className={styles.teamCard}>
                <p>Zaprosił: {invite.invitedByUser?.email}</p>
                <p>Do zespołu: {invite.team.name}</p>
                <button>Akceptuj</button>
                <button>Odrzuć</button>
              </div>
            ))
          ) : (
            <p>Nie masz żadnych zaproszeń.</p>
          )}
        </div>
      )}
      <hr />

      <h2>Twoje zespoły</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <Spinner animation="border" role="status" variant="light">
            <span className="sr-only">Ładowanie...</span>
          </Spinner>
        </div>
      ) : (
        <div className={styles.teamsList}>
          {teams.length > 0 ? (
            teams.map((team) => (
              <div key={team.id} className={styles.teamCard}>
                <h2>{team.name}</h2>
                <p>Ilość członków: {team.users.length}</p>
              </div>
            ))
          ) : (
            <p>Nie masz jeszcze żadnych zespołów.</p>
          )}
        </div>
      )}

      {showAddTeamModal && (
        <PopUp
          header={<h2>Dodaj nowy zespół</h2>}
          body={
            <form onSubmit={(e) => { e.preventDefault(); handleAddTeam(); }}>
              <div className={styles.formGroup}>
                <label htmlFor="teamName">Nazwa zespołu</label>
                <input
                  type="text"
                  id="teamName"
                  value={team.teamName}
                  onChange={(e) =>
                    setTeam({ ...team, teamName: e.target.value })
                  }
                  placeholder="Wpisz nazwę zespołu"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="users">Użytkownicy</label>
                <Multiselect
                  options={users}
                  displayValue="email"
                  onSelect={onSelect}
                  onRemove={onRemove}
                  placeholder="Wybierz użytkowników"
                  emptyRecordMsg="Brak użytkowników"
                  loading={loading}
                />
              </div>
            </form>
          }
          footer={
            <>
              <button onClick={toggleAddTeamClick}>Anuluj</button>
              <button onClick={handleAddTeam}>Dodaj zespół</button>
            </>
          }
          onClose={toggleAddTeamClick}
        />
      )}
    </div>
  );
};

export default TeamPage;