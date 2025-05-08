import React, { useEffect, useState, useRef } from "react";
import styles from "./Header.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "../../context/UserContext";
import { IKanban } from "../../interfaces/IKanban";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ITeamInvite } from "../../interfaces/ITeamInvite";
import PolishFlag from "../../assets/TranslationImages/polish.webp";
import EnglishFlag from "../../assets/TranslationImages/english.webp";

const Header: React.FC = () => {
  const api = useApiJson();
  const location = useLocation();
  const { user, logout } = useUser();
  const isAuthenticated = !!user;
  const [showBoardsModal, setShowBoardsModal] = useState(false);
  const [kanbanBoards, setKanbanBoards] = useState<IKanban[]>([]);
  const [teamInvites, setTeamInvites] = useState<ITeamInvite[]>([]);
  const { t, i18n } = useTranslation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const toggleBoardsModal = () => {
    setShowBoardsModal(!showBoardsModal);
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setShowLanguageDropdown(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      languageDropdownRef.current &&
      !languageDropdownRef.current.contains(event.target as Node)
    ) {
      setShowLanguageDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const fetchTeamInvites = async () => {
    try {
      const { data } = await api.get<ApiResponse<ITeamInvite[]>>(
        `teams/invites/${user?.id}`
      );
      setTeamInvites(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch team invites:", error);
    }
  };

  useEffect(() => {
    fetchKanbanBoards();
    fetchTeamInvites();
  }, [user, location]);

  return (
    <header className={styles.mainHeader}>
      <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
        <div className="container">
          <Link className={`navbar-brand ${styles.logo}`} to="/">
            KanbanPro
          </Link>
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
              {isAuthenticated ? (
                // Opcje dla zalogowanego użytkownika
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${styles.navLink}`}
                      to="/my-teams"
                    >
                      {t("my-teams")}
                      {teamInvites.length > 0 && (
                        <span className={styles.inviteBadge}>
                          {teamInvites.length}
                        </span>
                      )}
                    </Link>
                  </li>
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
                      {t("my-boards")}
                    </button>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${styles.navLink}`}
                      to={`/profile?email=${user.email}`}
                    >
                      {t("profile")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${styles.navLink}`}
                      to="/settings"
                    >
                      {t("settings")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${styles.navLink}`}
                      onClick={logout}
                      style={{ background: "none", border: "none" }}
                    >
                      {t("logout")}
                    </button>
                  </li>
                </>
              ) : (
                // Opcje dla niezalogowanego użytkownika
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${styles.navLink}`} to="/login">
                      {t("sign-in")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${styles.signupButton}`}
                      to="/signup"
                    >
                      {t("register")}
                    </Link>
                  </li>
                </>
              )}
              
              {/* Language Selector - Fixed ref by moving it to the div inside */}
              <li className="nav-item">
                <div className={styles.languageSelector} ref={languageDropdownRef}>
                  <button
                    className={`${styles.languageButton} ${styles.navLink}`}
                    onClick={toggleLanguageDropdown}
                  >
                    {i18n.language === "pl" ? (
                      <img src={PolishFlag} alt="Polski" className={styles.flagIcon} />
                    ) : (
                      <img src={EnglishFlag} alt="English" className={styles.flagIcon} />
                    )}
                    <span className={styles.currentLanguage}>
                      {i18n.language === "pl" ? "PL" : "EN"}
                    </span>
                    {/* Add dropdown arrow indicator */}
                    <span className={styles.dropdownArrow}>▼</span>
                  </button>
                  
                  <div className={`${styles.languageDropdown} ${showLanguageDropdown ? styles.show : ""}`}>
                    <button
                      className={styles.languageOption}
                      onClick={() => changeLanguage("pl")}
                    >
                      <img src={PolishFlag} alt="Polski" className={styles.flagIcon} />
                      <span>Polski</span>
                    </button>
                    <button
                      className={styles.languageOption}
                      onClick={() => changeLanguage("en")}
                    >
                      <img src={EnglishFlag} alt="English" className={styles.flagIcon} />
                      <span>English</span>
                    </button>
                  </div>
                </div>
              </li>
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
              <h5 className={styles.modalTitle}>{t("my-kanban-boards")}</h5>
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
                      <span>{board.users?.length} {t("participants")}</span>
                      <Link
                        to={`/boards/${board.id}`}
                        className={styles.viewBoardBtn}
                      >
                        {t("open")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.newBoardOption}>
                <Link to="/boards/new" className={styles.newBoardBtn}>
                  + {t("create-new-board")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;