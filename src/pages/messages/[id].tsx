import { useEffect, useRef, useState } from "react";
import { ChatInput } from "~/pages/api/chat/chat-input";
import { useSession } from "next-auth/react";
import { BsTrash } from "react-icons/bs";
import { useSocket } from "~/pages/api/providers/socket-provider";
import {
  AiOutlineArrowLeft,
  AiOutlineBell,
  AiOutlinePlus,
  AiOutlineStar,
} from "react-icons/ai";
import { useRouter } from "next/router";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import UserNavigation from "~/components/navigation/userNavigation";

interface Data {
  id: string;
  name: string;
  content: string;
  lastMessageUsername: string | null;
  lastMessage: string | null;
  fileUrl: string | null;
  updatedAt: Date;
  deleted: boolean;
  seen: boolean;
}

interface MessageData {
  id: string;
  content: string;
  memberId: string;
  fileUrl: string;
  deleted: boolean;
  createdAt: Date;
}

const DisplayConversationElement = () => {
  const notificationSoundSrc = "/sounds/newMessage.mp3";
  const { socket } = useSocket();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >("");
  const [conversations, setConversations] = useState<Data[] | null>(null);
  const [selectedConversationName, setSelectedConversationName] =
    useState<string>("");
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [update, setUpdate] = useState(true);

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(null);
  const [otherMemberName, setOtherMemberName] = useState<string>("");

  const topSentinelRef = useRef(null);

  function updateSeenStatus() {
    const updatedConversations: Data[] =
      conversations?.map((conversation) => {
        if (conversation.id === selectedConversation) {
          return {
            ...conversation,
            seen: true,
          };
        }
        return conversation;
      }) ?? [];

    setConversations(updatedConversations);
  }
  useEffect(() => {
    updateSeenStatus();
  }, [messages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (!isContainerFull()) {
            loadOldMessages();
          }
        }
      },
      {
        threshold: 1.0,
      },
    );

    if (topSentinelRef.current) {
      observer.observe(topSentinelRef.current);
    }

    return () => {
      if (topSentinelRef.current) {
        observer.unobserve(topSentinelRef.current);
      }
    };
  }, [cursor]);

  useEffect(() => {
    const handleScroll = () => {
      if (messageContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          messageContainerRef.current;
        if (Math.abs(scrollHeight - clientHeight + scrollTop) < 20) {
          loadOldMessages();
        }
      }
    };
    if (messageContainerRef.current) {
      const messageContainer = messageContainerRef.current;
      messageContainer.addEventListener("scroll", handleScroll);

      return () => {
        messageContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [cursor]);

  async function handleDeleteMessage(messageId: string) {
    try {
      const response = await fetch("/api/chat/deleteMessage/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user.id,
          conversationId: selectedConversation,
          messageId: messageId,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prevMessages) =>
          prevMessages.filter((m) => m.id !== messageId),
        );
        socket.emit("deleteMessage", {
          conversationId: selectedConversation,
          messageId,
        });
      } else {
        console.error("Failed to delete the message.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  function timePassed(messageSentTime: Date): string {
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - messageSentTime.getTime();

    const secondsPast = Math.floor(timeDifference / 1000); // Corrected from 6000 to 1000
    const minutesPast = Math.floor(secondsPast / 60);

    const hoursPast = Math.floor(minutesPast / 60);
    const daysPast = Math.floor(hoursPast / 24);

    let timePastString = "";
    if (secondsPast < 60) {
      if (secondsPast == 0) {
        timePastString = `1 second(s) ago`;
      } else {
        timePastString = `${secondsPast} second(s) ago`;
      }
    } else if (minutesPast < 60) {
      timePastString = `${minutesPast} minute(s) ago`;
    } else if (hoursPast < 24) {
      timePastString = `${hoursPast} hour(s) ago`;
    } else {
      timePastString = `${daysPast} day(s) ago`;
    }
    return timePastString;
  }

  async function getDirectMessages(conversationId: string) {
    setCursor(null);
    try {
      const response = await fetch("/api/chat/directMessages/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user.id,
          conversationId: conversationId,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.items);
        setCursor(data.nextCursor);
        setOtherMemberName(data.otherMemberName);
      }
    } catch (error) {
      console.error("An error occurred while fetching direct messages:", error);
    }
  }

  async function loadOldMessages() {
    if (cursor) {
      try {
        const response = await fetch("/api/chat/directMessages/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session?.user.id,
            conversationId: selectedConversation,
            cursor: cursor,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setMessages((prevMessages) => [...prevMessages, ...data.items]);
          setCursor(data.nextCursor);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching older messages:",
          error,
        );
      }
    }
  }

  function isContainerFull() {
    updateSeenStatus();
    if (messageContainerRef.current) {
      const { scrollHeight, clientHeight } = messageContainerRef.current;
      return scrollHeight > clientHeight;
    }
    return false;
  }

  async function newConvo() {
    try {
      const response = await fetch("/api/user/getOrCreateConversation/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberOneId: session?.user.memberId,
          name: selectedConversationName,
          age: selectedAge,
          gender: selectedGender,
        }),
      });
      if (response.ok) {
        setUpdate(!update);
        const data = await response.json();
        setSelectedConversation(data.id);
        setSelectedAge("");
        setSelectedConversationName("");
        setSelectedGender("");
        router.push(data.id);
      } else {
        console.error("Failed to create conversation", response);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  function joinConversation(conversation: string) {
    if (socket) {
      socket.emit("joinConversation", conversation);
    }
    router.push(`/messages/${conversation}`);
  }

  const router = useRouter();

  useEffect(() => {
    const conversationId = router.query.id as string;
    if (conversationId === "t") {
      setSelectedConversation(null);
      setMessages([]);
    } else if (conversationId) {
      setSelectedConversation(conversationId);
      getDirectMessages(conversationId);
      joinConversation(conversationId);
    }
  }, [router.query.id]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (
        conversationId: string,
        newMessage: MessageData,
      ) => {
        getConversations();
        if (conversationId === selectedConversation) {
          setMessages((messages) => [newMessage, ...messages]);
        }
      };

      const isActive = (conversationId: string, senderId: string) => {
        if (session?.user.memberId != senderId) {
          if (selectedConversation === conversationId) {
            socket.emit("responseIsActive", {
              conversationId,
              senderId,
              active: true,
            });
          } else {
            socket.emit("responseIsActive", {
              conversationId,
              senderId,
              active: false,
            });
          }
        }
      };

      const handleMessageDeleted = (deletedMessageId: string) => {
        setMessages((messages) =>
          messages.filter((message) => message.id !== deletedMessageId),
        );
        if (!isContainerFull()) {
          loadOldMessages();
        }
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("messageDeleted", handleMessageDeleted);
      socket.on("isActive", isActive);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messageDeleted", handleMessageDeleted);
        socket.off("isActive", isActive);
      };
    }
  }, [socket, selectedConversation]);

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
    if (session?.user.id) {
      getConversations();
    }
  }, [session?.user.id, update, socket]);

  if (session?.user.memberId) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        {selectedConversation != null ? (
          <div className="hidden md:block">
            <UserNavigation />
          </div>
        ) : (
          <div className="block md:block">
            <UserNavigation />
          </div>
        )}
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
                onClick={() => setSelectedConversation("")}
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
                  onClick={() => setSelectedConversation("")}
                >
                  <AiOutlinePlus />
                </button>
              </div>
              <div ref={topSentinelRef} id="sentinel"></div>
              {conversations.map((conversation: Data, index) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    getDirectMessages(conversation.id);
                    joinConversation(conversation.id);
                  }}
                  className={`flex w-full animate-slideInFromLeft items-center justify-between rounded-2xl px-2 py-2 shadow-sm hover:bg-gray-200 focus:outline-none`}
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
                      <img
                        className="m-2 h-12 w-12 rounded-full"
                        src="/images/avatar_logo.png"
                        alt="Logo"
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
                              ? `${conversation.lastMessage.substring(
                                  0,
                                  20,
                                )}...`
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
                    <div className="p-3 text-base duration-300 hover:text-red-600">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <BsTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={`${
            selectedConversation != null ? "flex" : "hidden"
          } h-full w-full flex-col bg-gray-100  pb-5 md:flex md:pt-[65px]`}
        >
          <div className="flex h-[53px] w-full items-center justify-between border-b border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center ">
              <button
                onClick={() => {
                  joinConversation("t");
                  setSelectedConversation("");
                  setOtherMemberName("");
                }}
              >
                <AiOutlineArrowLeft className="text-2xl" />
              </button>
              <img
                className="ml-5 mr-3 h-10 w-10 rounded-full"
                src="/images/avatar_logo.png"
                alt="Logo"
              />
              <h2 className="text-xl font-bold">{otherMemberName}</h2>
            </div>
            <div className="flex gap-2 text-xl">
              <button className="rounded-full  px-2 py-2 text-black">
                <AiOutlineBell />
              </button>
              <button className="rounded-full  px-2 py-2 text-black">
                <FaRegMoneyBillAlt />
              </button>
              <button className="rounded-full  px-2 py-2 text-black">
                <AiOutlineStar />
              </button>
            </div>
          </div>
          <div className="flex flex-grow flex-col-reverse overflow-y-auto pl-5">
            {selectedConversation == "" ? (
              <>
                {selectedConversationName == "" ? (
                  <div className="flex">
                    <button
                      onClick={() =>
                        setSelectedConversationName("Business advice")
                      }
                      className="p-5"
                    >
                      Business advice
                    </button>
                    <button
                      onClick={() =>
                        setSelectedConversationName("Moral support")
                      }
                      className="p-5"
                    >
                      Moral support
                    </button>
                    <button
                      onClick={() =>
                        setSelectedConversationName("Relationship advice")
                      }
                      className="p-5"
                    >
                      Relationship advice
                    </button>
                  </div>
                ) : (
                  <>
                    {selectedAge == "" ? (
                      <div>
                        <button
                          onClick={() => setSelectedAge("1")}
                          className="p-5"
                        >
                          20-35
                        </button>
                        <button
                          onClick={() => setSelectedAge("2")}
                          className="p-5"
                        >
                          35-50
                        </button>
                        <button
                          onClick={() => setSelectedAge("3")}
                          className="p-5"
                        >
                          50-70
                        </button>
                      </div>
                    ) : (
                      <>
                        {selectedGender == "" ? (
                          <div>
                            <button
                              onClick={() => {
                                setSelectedGender("WOMAN");
                                newConvo();
                              }}
                              className="p-5"
                            >
                              girl
                            </button>
                            <button
                              onClick={() => {
                                setSelectedGender("MAN");
                                newConvo();
                              }}
                              className="p-5"
                            >
                              boy
                            </button>
                            <button
                              onClick={() => {
                                setSelectedGender("OTHER");
                                newConvo();
                              }}
                              className="p-5"
                            >
                              Don't care
                            </button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <div
                className={`flex flex-grow flex-col-reverse overflow-y-auto`}
                ref={messageContainerRef}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`relative my-[1px] max-w-lg rounded-2xl px-3 py-1 text-base ${
                      message.memberId === session?.user.memberId
                        ? "ml-auto bg-blue-600 text-white"
                        : "mr-auto bg-gray-400"
                    }`}
                  >
                    {message.fileUrl && (
                      <img
                        className="max-w-64 max-h-64 rounded-3xl"
                        src={`../${message.fileUrl}`}
                        alt="Sent file"
                      />
                    )}
                    <p className="message-content">{message.content}</p>
                    <div
                      className={`absolute top-1/2 hidden -translate-y-1/2 transform p-3 text-base text-black ${
                        message.memberId === session?.user.memberId
                          ? "ll right-[100%] mr-[-2px] flex items-center justify-end pr-4"
                          : "rr left-[100%] ml-[-2px] flex items-center pl-4"
                      }`}
                    >
                      <BsTrash
                        className={`hover:text-zinc-700 ${
                          message.memberId === session?.user.memberId
                            ? "ml-2"
                            : "mr-2"
                        }`}
                        onClick={() => handleDeleteMessage(message.id)}
                      />
                      <small className="block text-xs text-gray-700">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
                {cursor && (
                  <div className="mb-4 flex items-center justify-center">
                    <button
                      className="px-4 py-2 text-zinc-800"
                      onClick={loadOldMessages}
                    >
                      {selectedConversation !== null ? (
                        <span>Load More</span>
                      ) : (
                        <span></span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-[50px] flex-shrink-0 px-5 pt-2">
            <ChatInput
              senderId={session?.user.memberId}
              conversationId={selectedConversation ? selectedConversation : ""}
              type="conversation"
            />
          </div>
        </div>
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }
};

export default DisplayConversationElement;
