import { useState, useEffect, useRef } from "react";
import styles from "./ChatModal.module.scss";
import { IMessage } from "../../interfaces/IMessage";
import { useUser } from "../../context/UserContext";
import webSocketService from "../../services/webSocket.service";

interface ChatModalProps {
  onClose: () => void;
  kanbanId: string;
  isOpen: boolean;
}

// interface Message {
//   id: number;
//   sender: string;
//   content: string;
//   timestamp: string;
//   isCurrentUser: boolean;
// }

const ChatModal: React.FC<ChatModalProps> = ({ onClose, kanbanId, isOpen }) => {
  const user = useUser();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // const handleSendMessage = (e: React.FormEvent): void => {
  //   e.preventDefault();
  //   if (newMessage.trim() === "") return;

  //   const newMsg: IMessage = {
  //     id: messages.length + 1,
  //     senderName: "You",
  //     content: newMessage.trim(),
  //     createdAt: new Date(),
  //     isCurrentUser: true,
  //     isRead: true,
  //     senderId: user.user?.id || -1,
  //   };

  //   setMessages([...messages, newMsg]);
  //   setNewMessage("");
  // };

  // Get initials for the avatar
  const getInitials = (name: string): string => {
    console.log(name);
    if (name === "You") return "YO";

    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    if (isOpen) {
      webSocketService.joinRoom(kanbanId);

      webSocketService.sendMessage("loadMessages", kanbanId);

      webSocketService.onMessage("loadMessages", (loadedMessages) => {
        loadedMessages.forEach((message: IMessage) => {
          message.createdAt = new Date(message.createdAt);
        });
        setMessages(loadedMessages);
      });

      webSocketService.onMessage("receiveMessage", (message) => {
        message.createdAt = new Date(message.createdAt);
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        webSocketService.offMessage("loadMessages");
        webSocketService.offMessage("receiveMessage");
      };
    }
  }, [isOpen, kanbanId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      webSocketService.sendMessage("sendMessage", {
        kanbanId,
        senderId: user.user?.id,
        content: newMessage,
        sender: user.user,
      });
      setNewMessage("");
    }
  };

  return (
    <div className={styles.chatModalOverlay}>
      <div className={styles.chatModal}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <h3>Team Chat</h3>
          <div className={styles.chatControls}>
            <button
              className={styles.controlButton}
              onClick={onClose}
              aria-label="Close"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className={styles.chatMessages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageContainer} ${
                message.isCurrentUser || message.senderId === user.user?.id
                  ? styles.currentUser
                  : ""
              }`}
            >
              <div className={styles.avatarCircle}>
                {getInitials(
                  `${message.sender?.firstName} ${message.sender?.lastName}` ||
                    "You"
                )}
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageSender}>
                    {message.sender?.firstName}
                  </span>
                  <span className={styles.messageTime}>
                    {message.createdAt.toLocaleTimeString([], {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>
                <p className={styles.messageText}>{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input area */}
        <form className={styles.chatInputArea} onSubmit={sendMessage}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMessage(e.target.value)
            }
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!newMessage.trim()}
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
