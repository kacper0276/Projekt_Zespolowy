import React from "react";
import styles from "./MainPage.module.scss";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";
import { useTranslation } from "react-i18next";

const MainPage: React.FC = () => {
  const { t } = useTranslation();
  useWebsiteTitle(t("main-page"));
  const navigate = useNavigate();
  const handleStartFree = () => {
    navigate("/KanbanBoard"); 
  };

  return (
    <div className={styles.mainPage}>
      <main className={`container ${styles.mainContent}`}>
        <section className={`row ${styles.heroSection}`}>
          <div className="col-12 col-md-6 text-center text-md-start">
            <h1 className={styles.heroTitle}>
              {t("create-your-ideal-Kanban-board")}
            </h1>
            <p className={styles.heroSubtitle}>
              {t("manage-projects-organize-tasks-and-increase-productivity")}
            </p>
            <div className={styles.ctaButtons}>
              <button
                className={`btn ${styles.primaryCta}`}
                onClick={handleStartFree}
              >
                {t("start-for-free")}
              </button>
              <button className={`btn ${styles.secondaryCta}`}>
                {t("create-a-new-board")}
              </button>
            </div>
          </div>
          <div className="col-12 col-md-6 text-center">
            <div className={styles.heroImage}>
              <svg
                viewBox="0 0 400 300"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.kanbanSvg}
              >
                <defs>
                  <filter id="shadowEffect">
                    <feDropShadow
                      dx="3"
                      dy="3"
                      stdDeviation="5"
                      floodColor="rgba(0,0,0,0.3)"
                    />
                  </filter>
                  <linearGradient
                    id="boardGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#030030" />
                    <stop offset="100%" stopColor="#a5082e" />
                  </linearGradient>
                </defs>
                <rect
                  x="50"
                  y="50"
                  width="300"
                  height="200"
                  fill="url(#boardGradient)"
                  rx="10"
                  ry="10"
                  filter="url(#shadowEffect)"
                />
                <rect
                  x="70"
                  y="80"
                  width="260"
                  height="40"
                  fill="rgba(255,255,255,0.1)"
                  rx="5"
                  ry="5"
                />
                <rect
                  x="70"
                  y="140"
                  width="260"
                  height="40"
                  fill="rgba(255,255,255,0.1)"
                  rx="5"
                  ry="5"
                />
                <rect
                  x="70"
                  y="200"
                  width="260"
                  height="40"
                  fill="rgba(255,255,255,0.1)"
                  rx="5"
                  ry="5"
                />
              </svg>
            </div>
          </div>
        </section>

        <section className={`row ${styles.featuresSection}`}>
          <div className="col-12 text-center">
            <h2 className={styles.sectionTitle}>{t("our-features")}</h2>
          </div>
          <div className="col-md-4 text-center">
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className="bi bi-pencil"></i>
              </div>
              <h3>{t("edit")}</h3>
              <p>{t("customize-your-boards-to-your-needs")}</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className="bi bi-people"></i>
              </div>
              <h3>{t("cooperation")}</h3>
              <p>{t("work-together-in-real-time")}</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className="bi bi-grid"></i>
              </div>
              <h3>{t("integrations")}</h3>
              <p>{t("connect-to-other-tools")}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
