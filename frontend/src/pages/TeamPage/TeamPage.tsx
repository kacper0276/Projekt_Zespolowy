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
    setLoading(true);
    try {
      await api.post<ApiResponse<ITeam>>("teams", team);
      setShowAddTeamModal(false);
    } catch (error) {
      console.error("Error adding team:", error);
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
        console.error("Error fetching teams:", error);
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
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    setTeam({ ...team, invitedBy: userContext?.user ?? null });

    fetchTeams();
    fetchUsers();
  }, []);

  return (
    <div className={styles.teamPage}>
      <h1>Twoje zespoły</h1>
      {loading ? (
        <Spinner />
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
          header={<></>}
          body={
            <form>
              <div className={styles.formGroup}>
                <label htmlFor="teamName">Nazwa zespołu</label>
                <input
                  type="text"
                  id="teamName"
                  value={team.teamName}
                  onChange={(e) =>
                    setTeam({ ...team, teamName: e.target.value })
                  }
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
              <button onClick={toggleAddTeamClick}>Zamknij</button>
              <button onClick={handleAddTeam}>Dodaj</button>
            </>
          }
        />
      )}

      <button className={styles.addTeamButton} onClick={toggleAddTeamClick}>
        +
      </button>
    </div>
  );
};

export default TeamPage;
