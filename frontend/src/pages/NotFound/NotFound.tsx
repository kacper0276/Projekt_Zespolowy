import React from "react";
import styles from "./NotFound.module.scss";
import useWebsiteTitle from "../../hooks/useWebsiteTitle";

const NotFound: React.FC = () => {
  useWebsiteTitle("Nie znaleziono strony");

  return (
    <div className={styles.mainContainer}>
      <h1>404 - Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFound;
