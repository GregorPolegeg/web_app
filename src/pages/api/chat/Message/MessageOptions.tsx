"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { BsTrash } from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa";

interface MessageOptionsProps {
  memberId: string;
  messageId: string;
  messageContent: string;
  createdAt: Date;
  isTouch: boolean;
  showOptions: boolean;
  handleDeleteMessage: (messageId: string) => void;
  copyTextToClipboard: (text: string) => void;
  setShowOptions: (showOptions: boolean) => void;
}

const MessageOptions: React.FC<MessageOptionsProps> = ({
  memberId,
  messageId,
  messageContent,
  createdAt,
  isTouch,
  setShowOptions,
  handleDeleteMessage,
  copyTextToClipboard,
  showOptions,
}) => {
  const date = new Date(createdAt);
  const timeString = date.toLocaleTimeString();
  const { data: session } = useSession();
  const showUpdate = () => {
    setShowOptions(false);
  };

  if (isTouch && showOptions && session) {
    return (
      <>
        <div
          className="z-1 fixed inset-0 bg-black bg-opacity-40"
          onClick={() => showUpdate()}
        />
        <div className="fixed bottom-0 left-0 z-10 flex w-full flex-col gap-y-5 rounded-xl bg-white p-3 py-5 text-2xl text-black">
          <small className="block text-base text-gray-700">
            {messageContent == "" ? "file" : messageContent} - {timeString}
          </small>
          <div
            className="flex items-center gap-4 gap-y-4"
            onClick={() => handleDeleteMessage(messageId)}
          >
            <BsTrash className="hover:text-zinc-700" />
            <p className="text-base">Delete</p>
          </div>
          <div
            className="flex items-center gap-4"
            onClick={() => {
              copyTextToClipboard(messageContent);
              showUpdate();
            }}
          >
            <FaRegCopy className="hover:text-zinc-700" />
            <p className="text-base">Copy</p>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div>
        <div
          className={`hidden gap-2 px-2 text-base text-black ${
            memberId === session?.user.memberId
              ? "ll flex flex-row-reverse items-center "
              : "rr flex  items-center"
          }`}
        >
          <BsTrash
            className={`hover:text-zinc-700`}
            onClick={() => handleDeleteMessage(messageId)}
          />
          <FaRegCopy
            className={"hover:text-zinc-700 text-bold"}
            onClick={() => copyTextToClipboard(messageContent)}
          />
          <small className="block text-sm text-gray-700">{timeString}</small>
        </div>
      </div>
    );
  }
};

export default MessageOptions;
