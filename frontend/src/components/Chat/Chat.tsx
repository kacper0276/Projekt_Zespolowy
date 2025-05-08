import React from "react";
import styles from "./Chat.module.scss";

const Chat: React.FC = () => {
  return (
    <div className={styles.chat}>
      <h1>Chat</h1>
      <p>This is the chat component.</p>
      <p>
        It will be used to display messages and allow users to send messages.
      </p>
      <p>It will also be used to display the list of users in the chat.</p>
    </div>
  );
};

export default Chat;
