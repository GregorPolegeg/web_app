import React, { useEffect, useState } from "react";
import { MdError, MdCheckCircle, MdInfo } from "react-icons/md";

type NotificationProps = {
  text: string;
  type: "Success" | "Error" | "Notification";
};

const Notification: React.FC<NotificationProps> = ({ text, type }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  let bgColor = "";
  let borderColor = "";
  let textColor = "";
  let icon = null;

  switch (type) {
    case "Success":
      bgColor = "bg-green-500";
      borderColor = "border-green-700";
      textColor = "text-white";
      icon = <MdCheckCircle className="text-2xl text-white" />;
      break;
    case "Error":
      bgColor = "bg-red-500";
      borderColor = "border-red-700";
      textColor = "text-white";
      icon = <MdError className="text-2xl text-white" />;
      break;
    case "Notification":
      bgColor = "bg-blue-500";
      borderColor = "border-blue-700";
      textColor = "text-white";
      icon = <MdInfo className="text-2xl text-white" />;
      break;
    default:
      break;
  }

  useEffect(() => {
    const timerfadeOut = setTimeout(() => {
      setFadeOut(true);
    }, 5000);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => {
      clearTimeout(timerfadeOut);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fade-in fixed bottom-5 left-1/2 -translate-x-1/2 transform rounded-xl ${bgColor} border ${borderColor} ${
        fadeOut ? "fade-out" : ""
      } flex items-center justify-center p-3 `}
    >
      {icon}
      <span className={`pl-3 ${textColor}`}>{text}</span>
    </div>
  );
};

export default Notification;