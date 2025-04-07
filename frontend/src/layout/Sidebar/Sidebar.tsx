import React, { useState } from "react";
import styles from "./Sidebar.module.scss";

const Sidebar = () => {
  const [isMinimized, setIsMinimized] = useState(false);
 
  // Dummy users data
  const users = [
    { id: 1, firstName: "John", lastName: "Doe" },
    { id: 2, firstName: "Sarah", lastName: "Parker" },
    { id: 3, firstName: "Mike", lastName: "Johnson" },
    { id: 4, firstName: "Anna", lastName: "Brown" },
    { id: 5, firstName: "Tom", lastName: "Wilson" }
  ];

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  // Function to get initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };
 
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isMinimized ? styles.minimized : ""}`}>
        {/* Toggle Button */}
        <div className={styles.toggleButton} onClick={toggleSidebar}>
          <i className={`bi ${isMinimized ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
        </div>
       
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>
            {isMinimized ? "" : "Users"}
          </h3>
        </div>
       
        {/* Users Section */}
        <div className={styles.usersSection}>
          {users.map(user => (
            <div key={user.id} className={styles.userCircle}>
              <div className={styles.avatarCircle}>
                {getInitials(user.firstName, user.lastName)}
              </div>
              {!isMinimized && (
                <span className={styles.userName}>
                  {user.firstName} {user.lastName}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;