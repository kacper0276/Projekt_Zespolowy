import React, { useEffect, useState } from "react";
import styles from "./Header.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "../../context/UserContext";
import { IKanban } from "../../interfaces/IKanban";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";

const Header: React.FC = () => {
  const api = useApiJson();
  const { user, logout } = useUser();
  const isAuthenticated = !!user;
  const [showBoardsModal, setShowBoardsModal] = useState(false);
  const [kanbanBoards, setKanbanBoards] = useState<IKanban[]>([]);

  const toggleBoardsModal = () => {
    setShowBoardsModal(!showBoardsModal);
  };

  const fetchKanbanBoards = async () => {
    try {
      const { data } = await api.get<ApiResponse<IKanban[]>>("kanban/user", {
        params: { email: user?.email },
      });
      setKanbanBoards(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch kanban boards:", error);
    }
  };

  useEffect(() => {
    fetchKanbanBoards();
  }, [user]);

  return (
    <header className={styles.mainHeader}>
      <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
        <div className="container">
          <a className={`navbar-brand ${styles.logo}`} href="/">
            KanbanPro
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className={`navbar-nav ms-auto ${styles.navItems}`}>
              <li className="nav-item">
                <a className={`nav-link ${styles.navLink}`} href="/features">
                  Funkcje
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${styles.navLink}`} href="/pricing">
                  Cennik
                </a>
              </li>

              {isAuthenticated ? (
                // Opcje dla zalogowanego użytkownika
                <>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${styles.navLink}`}
                      onClick={toggleBoardsModal}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Moje Tablice
                    </button>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${styles.navLink}`}
                      href="/dashboard"
                    >
                      Panel
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${styles.navLink}`}
                      href={`/profile?email=${user.email}`}
                    >
                      Profil
                    </a>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${styles.navLink}`}
                      onClick={logout}
                      style={{ background: "none", border: "none" }}
                    >
                      Wyloguj
                    </button>
                  </li>
                </>
              ) : (
                // Opcje dla niezalogowanego użytkownika
                <>
                  <li className="nav-item">
                    <a className={`nav-link ${styles.navLink}`} href="/login">
                      Zaloguj się
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${styles.signupButton}`}
                      href="/signup"
                    >
                      Rejestracja
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Modal dla "Moje Tablice" */}
      {showBoardsModal && (
        <div className={styles.modalBackdrop} onClick={toggleBoardsModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>Moje Tablice Kanban</h5>
              <button
                type="button"
                className={styles.closeButton}
                onClick={toggleBoardsModal}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.boardsGrid}>
                {kanbanBoards.map((board) => (
                  <div key={board.id} className={styles.boardCard}>
                    <h6>{board.tableName}</h6>
                    <div className={styles.descriptionWrapper}>
                      {/* <p>{board.description}</p> */}
                    </div>
                    <div className={styles.boardMeta}>
                      <span>{board.users?.length} uczestników</span>
                      <a
                        href={`/boards/${board.id}`}
                        className={styles.viewBoardBtn}
                      >
                        Otwórz
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.newBoardOption}>
                <a href="/boards/new" className={styles.newBoardBtn}>
                  + Utwórz nową tablicę
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
