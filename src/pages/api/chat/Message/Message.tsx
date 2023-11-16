
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { BsTrash } from "react-icons/bs";
import { getFileType } from "../getFileType/getFileType";
import ImageModal from "../ImageModal/ImageModal";
import { FaRegCopy } from "react-icons/fa";

type MessageProps = {
  messageId: string;
  memberId: string;
  messageContent: string;
  fileUrl: string | null;
  createdAt: Date;
  handleDeleteMessage: (messageId: string) => void;
};

const Message: React.FC<MessageProps> = ({
  messageId,
  memberId,
  messageContent,
  fileUrl,
  createdAt,
  handleDeleteMessage,
}) => {
  const { data: session } = useSession();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const copyTextToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.maxTouchPoints > 0,
    );
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showOptions && !target.closest(".message-container")) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      setShowOptions(true);
    }, 500);
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <div
      onTouchStart={isTouch ? startLongPress : undefined}
      onTouchEnd={isTouch ? endLongPress : undefined}
      onMouseDown={!isTouch ? startLongPress : undefined}
      onContextMenu={handleContextMenu}
      onMouseUp={!isTouch ? endLongPress : undefined}
      key={messageId}
      className={` ${
        isTouch ? "" : "message-hover"
      } message-container max-w-lg text-base ${
        memberId === session?.user.memberId
          ? "ml-auto flex flex-row-reverse pr-2"
          : "mr-auto flex"
      }`}
    >
      <div>
        {fileUrl && (
          <>
            {getFileType(fileUrl) === "image" && (
              <div>
                <ImageModal
                  url={`/${fileUrl}`}
                  className="max-w-64 max-h-64 rounded-3xl pt-2"
                  alt="Sent content"
                />
              </div>
            )}
            {getFileType(fileUrl) === "video" && (
              <video
                className="max-w-64 max-h-64 rounded-3xl pt-2"
                controls
                src={`../${fileUrl}`}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </>
        )}
        <div
          className={`flex w-full ${
            memberId === session?.user.memberId ? "flex-row-reverse" : ""
          }`}
        >
          {messageContent ? (
            <p
              className={`message-content my-[1px] inline-block max-w-lg rounded-2xl px-3 py-1 text-base ${
                memberId === session?.user.memberId
                  ? " bg-blue-600 text-white"
                  : " bg-gray-400"
              }`}
            >
              {messageContent}
            </p>
          ) : (
            ""
          )}
        </div>
      </div>
      <div
        className={` 
        ${
          isTouch
            ? showOptions
              ? memberId === session?.user.memberId
                ? "flex-row-reverse"
                : ""
              : "hidden"
            : "hidden"
        } z-1 gap-2 rounded-3xl bg-white text-xl text-black ${
          memberId === session?.user.memberId
            ? "ll flex items-center justify-end px-4"
            : "rr flex items-center px-4"
        }`}
      >
        <BsTrash
          className={`hover:text-zinc-700 `}
          onClick={() => handleDeleteMessage(messageId)}
        />
        <FaRegCopy
          className={"hover:text-zinc-700"}
          onClick={() => {
            copyTextToClipboard(messageContent);
            setShowOptions(false);
          }}
        />
        <small className="block text-sm text-gray-700">
          {new Date(createdAt).toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};

export default Message;
