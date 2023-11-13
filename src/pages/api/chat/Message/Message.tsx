import { useSession } from "next-auth/react";
import React from "react";
import { BsTrash } from "react-icons/bs";
import { getFileType } from "../getFileType/getFileType";
import ImageModal from "../ImageModal/ImageModal";

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

  return (
    <div
      key={messageId}
      className={` max-w-lg text-base ${
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
                  url={`../${fileUrl}`}
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
        className={`hidden text-base text-black ${
          memberId === session?.user.memberId
            ? "ll right-[100%] mr-[-2px] flex items-center justify-end pr-4"
            : "rr left-[100%] ml-[-2px] flex items-center pl-4"
        }`}
      >
        <BsTrash
          className={`hover:text-zinc-700 ${
            memberId === session?.user.memberId ? "ml-2" : "mr-2"
          }`}
          onClick={() => handleDeleteMessage(messageId)}
        />
        <small className="block text-xs text-gray-700">
          {new Date(createdAt).toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};

export default Message;
