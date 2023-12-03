import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import Notification from "../tools/Notification/Notification";
import { useSocket } from "./socket-provider";
import { useSession } from "next-auth/react";
import { getConversations } from "../tools/Notification/joinAllChats";

interface NotificationContextType {
  currentNotification: NotificationState | null;
  showNotification: (
    text: string,
    type: "Success" | "Error" | "Notification" | "WakeUp",
    link?: string,
  ) => void;
}

interface NotificationState {
  text: string;
  type: "Success" | "Error" | "Notification" | "Warning" | "WakeUp";
  link?: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const currentNotification = useRef<NotificationState | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<NotificationState[]>([]);
  const { socket } = useSocket();
  const { data: session } = useSession();

  const showNotification = (
    text: string,
    type: "Success" | "Error" | "Notification" | "Warning" | "WakeUp",
    link?: string,
  ) => {
    const isDuplicate = notificationQueue.some(
      (notification) =>
        notification.text === text &&
        notification.type === type &&
        (!notification.link || notification.link === link)
    ) || (
      currentNotification.current?.text === text &&
      currentNotification.current?.type === type &&
      (!currentNotification.current?.link || currentNotification.current?.link === link)
    );

    const newNotification = { text, type, link };
    if (!isDuplicate) {
      setNotificationQueue((prevQueue) => [...prevQueue, newNotification]);
    }
  };

  useEffect(() => {
    if (currentNotification.current === null && notificationQueue.length > 0) {
      const nextNotification = notificationQueue[0];
      currentNotification.current = nextNotification?? null;
      setNotificationQueue((prevQueue) => prevQueue.slice(1));

      setTimeout(() => {
        currentNotification.current = null;
      }, 6000);
    }
  }, [notificationQueue]);

  getConversations(session, socket);

  useEffect(() => {
    if (socket) {
      const handleWakeUp = (conversationId: string) => {
        showNotification(
          "Danny needed right now!",
          "WakeUp",
          `/messages/${conversationId}`,
        );
      };
      socket.on("wakeUp", handleWakeUp);
      return () => {
        socket.off("wakeUp", handleWakeUp);
      };
    }
  }, [socket]);

  return (
    <NotificationContext.Provider
      value={{ currentNotification: currentNotification.current, showNotification }}
    >
      {children}
      {currentNotification.current && (
        <Notification
          text={currentNotification.current.text}
          type={currentNotification.current.type}
          link={currentNotification.current.link}
        />
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
