import React from 'react';
import styles from './MainPage.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const MainPage: React.FC = () => {
  return (
    <div className={styles.mainPage}>
      <main className={`container ${styles.mainContent}`}>
        <section className={`row ${styles.heroSection}`}>
          <div className="col-12 col-md-6 text-center text-md-start">
            <h1 className={styles.heroTitle}>
              Stwórz swoją idealną tablicę Kanban
            </h1>
            <p className={styles.heroSubtitle}>
              Zarządzaj projektami, organizuj zadania i zwiększ produktywność
            </p>
            <div className={styles.ctaButtons}>
              <button className={`btn ${styles.primaryCta}`}>
                Rozpocznij za darmo
              </button>
              <button className={`btn ${styles.secondaryCta}`}>
                Obejrzyj demo
              </button>
            </div>
          </div>
          <div className="col-12 col-md-6 text-center">
            <div className={styles.heroImage}>
              <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className={styles.kanbanSvg}>
                <defs>
                  <filter id="shadowEffect">
                    <feDropShadow dx="3" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.3)"/>
                  </filter>
                  <linearGradient id="boardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#030030" />
                    <stop offset="100%" stopColor="#a5082e" />
                  </linearGradient>
                </defs>
                <rect x="50" y="50" width="300" height="200" 
                      fill="url(#boardGradient)" 
                      rx="10" ry="10" 
                      filter="url(#shadowEffect)"/>
                <rect x="70" y="80" width="260" height="40" fill="rgba(255,255,255,0.1)" rx="5" ry="5"/>
                <rect x="70" y="140" width="260" height="40" fill="rgba(255,255,255,0.1)" rx="5" ry="5"/>
                <rect x="70" y="200" width="260" height="40" fill="rgba(255,255,255,0.1)" rx="5" ry="5"/>
              </svg>
            </div>
          </div>
        </section>

        <section className={`row ${styles.featuresSection}`}>
          <div className="col-12 text-center">
            <h2 className={styles.sectionTitle}>Nasze funkcje</h2>
          </div>
          <div className="col-md-4 text-center">
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <h3>Edytuj</h3>
              <p>Dostosuj swoje tablice do swoich potrzeb</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>Współpraca</h3>
              <p>Pracuj razem w czasie rzeczywistym</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </div>
              <h3>Integracje</h3>
              <p>Połącz się z innymi narzędziami</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;