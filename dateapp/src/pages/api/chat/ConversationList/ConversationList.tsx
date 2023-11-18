import React, { useEffect, useState } from "react";
import { AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import { timePassed } from "../../time/route";
import { useSession } from "next-auth/react";
import { useSocket } from "../../providers/socket-provider";
import { useRouter } from "next/router";
import Image from 'next/image'
import { IoMdMore } from "react-icons/io";

type Conversation = {
  id: string;
  name: string;
  content: string;
  lastMessageUsername: string | null;
  lastMessage: string | null;
  fileUrl: string | null;
  updatedAt: string;
  seen: boolean;
};

type ConversationListProps = {
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  onOpenConversation: (id: string, fileUrl: string) => void;
  joinConversation: (conversationId: string) => void;
  setOtherMemberFileUrl: (fileUrl: string) => void;
};

const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversation,
  setSelectedConversation,
  onOpenConversation,
  joinConversation,
  setOtherMemberFileUrl,
}) => {
  const [conversations, setConversations] = useState<Conversation[] | null>(
    null,
  );

  const { data: session } = useSession();
  const { socket } = useSocket();
  const router = useRouter();
  function updateSeenStatus(conversationId: string) {
    const updatedConversations: Conversation[] =
      conversations?.map((conversation) => {
        if (conversation.id === conversationId) {
          return {
            ...conversation,
            seen: true,
          };
        }
        return conversation;
      }) ?? [];

    setConversations(updatedConversations);
  }

  const getConversations = async () => {
    try {
      const response = await fetch(
        "/api/user/components/getConversations/getConversationsAPI",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: session?.user.memberId }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (conversations?.length == 0) {
          data.forEach((conversation: { id: string }) => {
            joinConversation(conversation.id);
          });
          await joinConversation("t");
        }
        setConversations(data);
      } else {
        console.error("Failed to get conversations", response);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  useEffect(() => {
    const handleAnyEvent = () => {
      getConversations();
    };
    socket.onAny(handleAnyEvent);

    return () => {
      socket.offAny(handleAnyEvent);
    };
  }, [socket]);

  useEffect(() => {
    getConversations();
  }, []);
  useEffect(() => {
    if (session) {
      const foundCoversaiont = conversations?.find(
        (convo) => convo.id === router.query.id,
      );
      const fileUrl = foundCoversaiont?.fileUrl;
      setOtherMemberFileUrl(fileUrl ?? "");
    }
  }, [router.query.id, conversations]);

  return (
    <div
      className={`${
        selectedConversation == null ? "block" : "hidden"
      } h-full w-full border-r border-gray-300 pt-[65px] md:block md:w-[400px] md:min-w-[400px]`}
    >
      {conversations === null ? (
        <div>Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col border-gray-300">
          <h2 className="p-3 text-xl font-bold">No Coversations</h2>
          <button
            className="px-5 py-2 text-2xl"
            onClick={() => {setSelectedConversation(""); router.push("/")}}
          >
            <AiOutlinePlus />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-col ">
            <h2 className="p-3 text-xl font-bold">Messages</h2>
            <button
              className="px-5 py-2 text-2xl"
              onClick={() => {setSelectedConversation("t"); router.push("./t")}}
            >
              <AiOutlinePlus />
            </button>
          </div>
          {conversations.map((conversation: Conversation, index) => (
            <div
              key={conversation.id}
              onClick={() => {
                {
                  onOpenConversation(
                    conversation.id,
                    conversation.fileUrl ?? "",
                  );
                  updateSeenStatus(conversation.id);
                }
              }}
              className={`flex w-full animate-slideInFromLeft items-center justify-between rounded-2xl px-2 shadow-sm hover:bg-gray-200 no-highlight`}
              style={{ animationDelay: `${index * 0.1}s` }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setSelectedConversation(conversation.id);
                }
              }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Image
                    className="m-2 h-14 w-14 rounded-full"
                    src={`/${conversation.fileUrl}`}
                    alt="Logo"
                    width={56}
                    height={56}
                    layout="fixed"
                  />
                </div>
                <div className="flex flex-col pl-2">
                  <h1 className="text-left text-lg font-semibold">
                    {conversation.name}
                  </h1>
                  <p className="text-base font-medium">
                    {conversation.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conversation.lastMessage ? (
                      <span>
                        {conversation.lastMessageUsername}:{" "}
                        {conversation.lastMessage.length > 20
                          ? `${conversation.lastMessage.substring(0, 20)}...`
                          : conversation.lastMessage}{" "}
                        - {timePassed(new Date(conversation.updatedAt))}
                      </span>
                    ) : (
                      "No conversations"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {conversation.seen ? (
                  ""
                ) : (
                  <div className=" h-2 w-2 rounded-full bg-blue-600"></div>
                )}
                <div className="p-3 text-xl duration-300  rounded-full hover:text-blue-600">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <IoMdMore />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
