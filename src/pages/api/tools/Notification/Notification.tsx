import React, { useEffect, useState } from "react";
import { MdError, MdCheckCircle, MdInfo, MdWarning } from "react-icons/md";

type NotificationProps = {
  text: string;
  type: "Success" | "Error" | "Notification" | "Warning";
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
    case "Warning":
      bgColor = "bg-yellow-500";
      borderColor = "border-yellow-700";
      textColor = "text-white";
      icon = <MdWarning className="text-2xl text-white" />;
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
      className={`fade-in fixed top-5 md:bottom-5 md:top-auto w-full flex items-center  justify-center ${
        fadeOut ? "fade-out" : ""
      }`}
    >
      <div className={`flex items-center justify-center p-3 border ${bgColor} ${borderColor} rounded-xl`}>
        {icon}
        <span className={`pl-3 ${textColor}`}>{text}</span>
      </div>
    </div>
  );
};

export default Notification;
