import React from "react";
import styles from "./Footer.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.mainFooter}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h4 className={styles.footerTitle}>KanbanPro</h4>
            <p className={styles.footerDescription}>
              {t("professional-tool-for-managing-projects")}
            </p>
          </div>
          <div className="col-md-4">
            <h5 className={styles.linkTitle}>{t("quick-links")}</h5>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/features">{t("features")}</a>
              </li>
              <li>
                <a href="/pricing">{t("pricing")}</a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
                      <h5 className={styles.linkTitle}>{t("contact")}</h5>
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
              {t("copyright-disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
