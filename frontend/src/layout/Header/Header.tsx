import React from 'react';
import styles from './Header.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header: React.FC = () => {
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
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;