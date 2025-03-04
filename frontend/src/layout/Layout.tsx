import React, { ReactNode } from "react";
import styles from "./Layout.module.scss";

interface LayoutProps {
  header: ReactNode;
  content: ReactNode;
  footer: ReactNode;
  sidebar: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  header,
  content,
  footer,
  sidebar,
}) => {
  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>{header}</header>
      <div className="d-flex">
        <aside className={`${styles.sidebar} position-fixed`}>{sidebar}</aside>
        <main className={styles.content}>{content}</main>
      </div>
      <footer className={styles.footer}>{footer}</footer>
    </div>
  );
};

export default Layout;
