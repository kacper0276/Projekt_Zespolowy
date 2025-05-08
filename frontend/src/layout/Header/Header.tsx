import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./Header.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "../../context/UserContext";
import { IKanban } from "../../interfaces/IKanban";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ITeamInvite } from "../../interfaces/ITeamInvite";
import { IUser } from "../../interfaces/IUser";
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
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userSearchModalRef = useRef<HTMLDivElement>(null);
  const userListRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(5); // Liczba użytkowników na stronę


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

  // Resetowanie stanu wyszukiwania przy otwieraniu/zamykaniu modalu
  const toggleUserSearchModal = () => {
    setShowUserSearchModal(!showUserSearchModal);
    if (!showUserSearchModal) {
      setSearchTerm("");
      setUsers([]);
      setFilteredUsers([]);
      setPage(1);
      setHasMore(true);
      setTimeout(() => {
        fetchUsers(1);
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 100);
    }
  };

  // Zmodyfikowana funkcja do pobierania użytkowników z paginacją
  const fetchUsers = async (pageNum: number, term: string = "") => {
    if (!hasMore && pageNum > 1) return;
    
    setIsLoading(true);
    try {
      // Dodaj parametry paginacji do zapytania API
      const { data } = await api.get<ApiResponse<IUser[]>>("users/all", {
        params: {
          page: pageNum,
          pageSize: pageSize,
          search: term
        }
      });
      
      const newUsers = data.data || [];
      
      if (pageNum === 1) {
        setUsers(newUsers);
        setFilteredUsers(newUsers);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
        setFilteredUsers(prev => [...prev, ...newUsers]);
      }
      
      setHasMore(newUsers.length === pageSize);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obsługa wyszukiwania z debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Resetuj stan i pobierz nową listę użytkowników po wprowadzeniu tekstu do wyszukiwania
    setUsers([]);
    setFilteredUsers([]);
    setPage(1);
    setHasMore(true);
    
    // Użyj setTimeout do dodania efektu debounce
    setTimeout(() => {
      fetchUsers(1, term);
    }, 300);
  };

  // Funkcja do wykrywania przewijania i ładowania kolejnych danych
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore || !userListRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = userListRef.current;
    
    // Jeśli użytkownik przewinął prawie do końca, załaduj więcej danych
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchUsers(page + 1, searchTerm);
    }
  }, [isLoading, hasMore, page, searchTerm, userListRef]);

  // Dodaj obsługę zdarzenia scroll do kontenera listy użytkowników
  useEffect(() => {
    const currentUserListRef = userListRef.current;
    if (currentUserListRef) {
      currentUserListRef.addEventListener('scroll', handleScroll);
      return () => {
        currentUserListRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const handleUserClick = (userId: number) => {
    console.log(`User clicked: ${userId}`);
    toggleUserSearchModal();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      languageDropdownRef.current &&
      !languageDropdownRef.current.contains(event.target as Node)
    ) {
      setShowLanguageDropdown(false);
    }
  };

  // Obsługa kliknięcia poza modalem wyszukiwania
  useEffect(() => {
    const handleClickOutsideUserSearch = (event: MouseEvent) => {
      if (
        userSearchModalRef.current &&
        !userSearchModalRef.current.contains(event.target as Node)
      ) {
        setShowUserSearchModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideUserSearch);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideUserSearch);
    };
  }, []);

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
                  {/* Przycisk wyszukiwania użytkowników */}
                  <li className="nav-item">
                    <button
                      className={`nav-link ${styles.navLink}`}
                      onClick={toggleUserSearchModal}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {t("search-users")}
                    </button>
                  </li>
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
              
              {/* Language Selector */}
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

      {/* Modal dla wyszukiwania użytkowników z lazy loading */}
      {showUserSearchModal && (
        <div className={styles.modalBackdrop} onClick={toggleUserSearchModal}>
          <div
            className={`${styles.modalContent} ${styles.userSearchModal}`}
            onClick={(e) => e.stopPropagation()}
            ref={userSearchModalRef}
          >
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>{t("search-users")}</h5>
              <button
                type="button"
                className={styles.closeButton}
                onClick={toggleUserSearchModal}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={t("search-by-name-email") || "Search by name, email..."}
                  value={searchTerm}
                  onChange={handleSearch}
                  ref={searchInputRef}
                />
                <span className={styles.searchIcon}>🔍</span>
              </div>
              
              {/* Kontener listy użytkowników z referencją dla lazy loading */}
              <div 
                className={styles.userResultsContainer} 
                ref={userListRef}
              >
                {filteredUsers.length > 0 ? (
                  <div className={styles.usersList}>
                    {filteredUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className={styles.userCard}
                        onClick={() => handleUserClick(user.id)}
                      >
                        <div className={styles.userAvatar}>
                          {user.firstName?.[0] || user.login?.[0] || user.email?.[0]}
                        </div>
                        <div className={styles.userInfo}>
                          <h6>{user.firstName} {user.lastName}</h6>
                          <p>{user.email}</p>
                          <span className={`${styles.userStatus} ${user.isOnline ? styles.online : ""}`}>
                            {user.isOnline ? t("online") : t("offline")}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Wskaźnik ładowania na dole listy */}
                    {isLoading && (
                      <div className={styles.loadingIndicator}>
                        <div className={styles.spinner}></div>
                      </div>
                    )}
                  </div>
                ) : isLoading && page === 1 ? (
                  <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>{t("loading")}</p>
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    <p>{t("no-users-found")}</p>
                  </div>
                )}
                
                {/* Wiadomość "End of results" gdy nie ma więcej danych */}
                {!hasMore && filteredUsers.length > 0 && !isLoading && (
                  <div className={styles.endMessage}>
                    <p>{t("end-of-results")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;