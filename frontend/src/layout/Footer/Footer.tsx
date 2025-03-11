import React from "react";
import styles from "./Footer.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.mainFooter}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h4 className={styles.footerTitle}>KanbanPro</h4>
            <p className={styles.footerDescription}>
              Profesjonalne narzędzie do zarządzania projektami
            </p>
          </div>
          <div className="col-md-4">
            <h5 className={styles.linkTitle}>Szybkie linki</h5>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/features">Funkcje</a>
              </li>
              <li>
                <a href="/pricing">Cennik</a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5 className={styles.linkTitle}>Kontakt</h5>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialIcon}>
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 text-center">
            <p className={styles.copyright}>
              © 2025 KanbanPro. Wszelkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
