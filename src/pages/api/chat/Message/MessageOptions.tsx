import React, { useState } from "react";
import { BsTrash } from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa";

interface MessageOptionsProps {
  memberId: string;
  sessionUserId: string;
  messageId: string;
  messageContent: string;
  createdAt: Date;
  isTouch: boolean;
  handleDeleteMessage: (messageId: string) => void;
  copyTextToClipboard: (text: string) => void;
}

const MessageOptions: React.FC<MessageOptionsProps> = ({
  memberId,
  sessionUserId,
  messageId,
  messageContent,
  createdAt,
  isTouch,
  handleDeleteMessage,
  copyTextToClipboard,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const onDelete = () => {
    handleDeleteMessage(messageId);
    toggleOptions();
  };

  const onCopy = () => {
    copyTextToClipboard(messageContent);
    toggleOptions();
  };

  if (isTouch) {
    return (
      <div
        className={`${
          showOptions
            ? memberId === sessionUserId
              ? "flex-row-reverse"
              : ""
            : "hidden"
        } z-1 gap-2 rounded-3xl bg-white text-xl text-black ${
          memberId === sessionUserId
            ? "ll flex items-center justify-end px-4"
            : "rr flex items-center px-4"
        }`}
      >
        <BsTrash className={`hover:text-zinc-700`} onClick={onDelete} />
        <FaRegCopy className={"hover:text-zinc-700"} onClick={onCopy} />
        <small className="block text-sm text-gray-700">
          {createdAt.toLocaleTimeString()}
        </small>
      </div>
    );
  } else {
    return (
      <div>
        <div
          className={`hidden px-4 gap-2 text-xl text-black ${
            memberId === sessionUserId
              ? "ll flex items-center justify-end"
              : "rr flex items-center"
          }`}
        >
          <BsTrash className={`hover:text-zinc-700`} onClick={onDelete} />
          <FaRegCopy className={"hover:text-zinc-700"} onClick={onCopy} />
          <small className="block text-sm text-gray-700">
            {createdAt.toLocaleTimeString()}
          </small>
        </div>
      </div>
    );
  }
};

export default MessageOptions;
