import { useState, useEffect, useRef } from "react";
import styles from "./ChatModal.module.scss";
import { useTranslation } from "react-i18next";

interface ChatModalProps {
  onClose: () => void;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "John Doe",
      content: "Hi team, how's progress on the dashboard task?",
      timestamp: "10:25 AM",
      isCurrentUser: false
    },
    {
      id: 2,
      sender: "Anna Smith",
      content: "I've completed the UI design and started on the implementation.",
      timestamp: "10:27 AM",
      isCurrentUser: false
    },
    {
      id: 3,
      sender: "You",
      content: "Great! I'm working on the backend API. Should be ready by tomorrow.",
      timestamp: "10:30 AM",
      isCurrentUser: true
    },
    {
      id: 4,
      sender: "Michael Johnson",
      content: "I'll start testing once both parts are ready. Let me know when I can begin.",
      timestamp: "10:32 AM",
      isCurrentUser: false
    },
    {
      id: 5,
      sender: "John Doe",
      content: "Perfect! Let's sync up tomorrow afternoon to review progress.",
      timestamp: "10:35 AM",
      isCurrentUser: false
    }
  ]);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: messages.length + 1,
      sender: "You",
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  // Get initials for the avatar
  const getInitials = (name: string): string => {
    if (name === "You") return "YO";
    
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={styles.chatModalOverlay}>
      <div className={styles.chatModal}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <h3>{t("team-chat")}</h3>
          <div className={styles.chatControls}>
            <button 
              className={styles.controlButton} 
              onClick={onClose}
              aria-label={t("close")}
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
              className={`${styles.messageContainer} ${message.isCurrentUser ? styles.currentUser : ''}`}
            >
              <div className={styles.avatarCircle}>
                {getInitials(message.sender)}
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageSender}>{message.sender}</span>
                  <span className={styles.messageTime}>{message.timestamp}</span>
                </div>
                <p className={styles.messageText}>{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input area */}
        <form className={styles.chatInputArea} onSubmit={handleSendMessage}>
          <input
            type={t("text")}
            className={styles.messageInput}
            placeholder={t("type-your-message")}
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
          />
          <button 
            type={t("submit")} 
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