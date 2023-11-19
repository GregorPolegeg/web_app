import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { BsTrash } from "react-icons/bs";
import { getFileType } from "../getFileType/getFileType";
import ImageModal from "../ImageModal/ImageModal";
import { FaRegCopy } from "react-icons/fa";
import MessageOptions from "./MessageOptions";

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

  const copyToClipboard = async (data: string | HTMLImageElement) => {
    try {
      if (typeof data === "string") {
        await navigator.clipboard.writeText(data);
      } else if (data instanceof HTMLImageElement) {
        const blob = await fetch(data.src).then((r) => r.blob());
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
      } else {
        console.error(
          "The provided data is neither text nor an HTMLImageElement",
        );
      }
    } catch (err) {
      console.error("Failed to copy:", err);
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
      } message-container max-w-lg items-center text-base ${
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
            {getFileType(fileUrl) === "audio" && (
              <audio
                src={`../${fileUrl}`}
                controls
              >
                Your browser does not support the audio tag.
              </audio>
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
      <MessageOptions
        memberId={memberId}
        messageId={messageId}
        messageContent={messageContent}
        showOptions={showOptions}
        createdAt={createdAt}
        setShowOptions={setShowOptions}
        handleDeleteMessage={handleDeleteMessage}
        copyTextToClipboard={copyToClipboard}
        isTouch={isTouch}
      />
    </div>
  );
};

export default Message;
