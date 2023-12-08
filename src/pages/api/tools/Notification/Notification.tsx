import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { MdError, MdCheckCircle, MdInfo, MdWarning } from "react-icons/md";
import { getConversations } from "./joinAllChats";
import { useSocket } from "../../providers/socket-provider";
import { useSession } from "next-auth/react";
import { soundEffect } from "./soundEffect";

type NotificationProps = {
  text: string;
  type: "Success" | "Error" | "Notification" | "Warning" | "WakeUp";
  link?: string;
};

const Notification: React.FC<NotificationProps> = ({ text, type, link }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const {data: session} = useSession();
  const { socket } = useSocket();
  let bgColor = "";
  let borderColor = "";
  let textColor = "";
  let icon = null;
  getConversations(session,socket);

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
    case "WakeUp":
      bgColor = "bg-orange-500";
      borderColor = "border-orange-700";
      textColor = "text-white";
      icon = <FaBell className="text-2xl text-white" />;
      break;
    default:
      break;
  }
  soundEffect();

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
  if (link) {
    return (
      <Link href={link}>
        <div
          className={`fade-in fixed top-5 flex w-full items-center justify-center md:bottom-5  md:top-auto ${
            fadeOut ? "fade-out" : ""
          }`}
        >
          <div
            className={`flex items-center justify-center border p-3 ${bgColor} ${borderColor} rounded-xl`}
          >
            {icon}
            <span className={`pl-3 ${textColor}`}>{text}</span>
          </div>
        </div>
      </Link>
    );
  } else {
    return (
      <div
        className={`fade-in fixed top-5 flex w-full items-center justify-center md:bottom-5  md:top-auto ${
          fadeOut ? "fade-out" : ""
        }`}
      >
        <div
          className={`flex items-center justify-center border p-3 ${bgColor} ${borderColor} rounded-xl`}
        >
          {icon}
          <span className={`pl-3 ${textColor}`}>{text}</span>
        </div>
      </div>
    );
  }
};

export default Notification;
