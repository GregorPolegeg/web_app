import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification from "../tools/Notification/Notification";

interface NotificationContextType {
  notification: NotificationState | null;
  showNotification: (text: string, type: "Success" | "Error" | "Notification") => void;
  hideNotification: () => void;
}

interface NotificationState {
  text: string;
  type: "Success" | "Error" | "Notification" | "Warning";
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (text: string, type: "Success" | "Error" | "Notification" | "Warning") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const contextValue: NotificationContextType = {
    notification,
    showNotification,
    hideNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification && <Notification text={notification.text} type={notification.type} />}
    </NotificationContext.Provider>
  );
};
