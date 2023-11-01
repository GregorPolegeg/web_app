import { useEffect, useRef, useState } from "react";
import { ChatInput } from "~/pages/api/chat/chat-input";
import { useSession } from "next-auth/react";
import { BsTrash } from "react-icons/bs";
import { useSocket } from "~/pages/api/providers/socket-provider";

interface Data {
  id: string;
  name: string;
  content: string;
  fileUrl: string | null;
  memberId: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
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
  const { socket } = useSocket();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageData[]>([]);
  //left menu
  const [selectedConversation, setSelectedcConversation] = useState<string>("");
  const [conversations, setConversations] = useState<Data[] | null>(null);
  //for new conversation
  const [selectedConversationName, setSelectedConversationName] =
    useState<string>("");
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [update, setUpdate] = useState(true);

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(null);

  const topSentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if(!isContainerFull()){
          loadOldMessages();
          }
        }
      },
      {
        threshold: 1.0,
      }
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
        if (Math.abs(scrollHeight - clientHeight + scrollTop) == 0) {
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

  async function handleDeleteMessage(messageId : string) {
    try {
      const response = await fetch("/api/chat/deleteMessage/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user.id,
          conversationId: selectedConversation,
          messageId: messageId,  // This is important to tell the API which message to delete
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prevMessages => prevMessages.filter(m => m.id !== messageId));
        socket.emit("deleteMessage",{conversationId: selectedConversation ,messageId});
      } else {   
        console.error("Failed to delete the message.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
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
        getDirectMessages("");
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
  }

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (
        conversationId: string,
        newMessage: MessageData,
      ) => {
        if (conversationId === selectedConversation) {
          setMessages((messages) => [newMessage, ...messages]);
        }
      };
    
      const handleMessageDeleted = (deletedMessageId: string) => {
        setMessages((messages) => messages.filter(message => message.id !== deletedMessageId));
      };
    
      socket.on("newMessage", handleNewMessage);
      socket.on("messageDeleted", handleMessageDeleted);
    
      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messageDeleted", handleMessageDeleted);  
      };
    }
    
  }, [socket, selectedConversation]);

  useEffect(() => {
    //get all user conversations
    if (session?.user.id) {
      const fetchDetails = async () => {
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
            setConversations(data);
          } else {
            console.error("Failed to get conversations", response);
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      };

      fetchDetails();
    }
  }, [session?.user.id, update, socket]);

  if (session?.user.memberId) {
    return (
      <div className="flex h-full w-full overflow-hidden">
        {" "}
        {/* overflow-hidden added here */}
        <div className="h-full w-full md:w-[400px] md:min-w-[400px]">
          {conversations === null ? (
            <div>Loading...</div>
          ) : conversations.length === 0 ? (
            <div>No conversations</div>
          ) : (
            <div>
              <h2 className="border-b border-gray-300  p-5 text-center text-xl font-bold">
                Messages
              </h2>
              <div ref={topSentinelRef} id="sentinel"></div>
              {conversations.map((conversation: Data) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedcConversation(conversation.id);
                    getDirectMessages(conversation.id);
                    joinConversation(conversation.id);
                  }}
                  className="py flex w-full items-center justify-between border-b border-gray-300 px-2 py-3 duration-300 hover:bg-gray-200 focus:outline-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setSelectedcConversation(conversation.id);
                    }
                  }}
                >
                  <div className="flex flex-col">
                    <h1 className="pl-2 text-left">{conversation.name}</h1>
                    <div className="pl-2">
                      <p className="text-base font-[500]">
                        {conversation.content}
                      </p>
                      <p className="p text-xs text-gray-500">
                        kdo: Last message - 13h
                      </p>
                    </div>
                  </div>
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
              ))}
            </div>
          )}
        </div>
        <div className="flex h-full w-full flex-col bg-gray-100 p-5">
          <div className="flex flex-grow flex-col-reverse overflow-y-auto">
            {" "}
            {/* overflow-y-auto added here */}
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
                className="flex flex-grow flex-col-reverse overflow-y-auto"
                ref={messageContainerRef}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`text-normal relative my-[1px] max-w-lg rounded-2xl px-3 py-1 ${
                      message.memberId === session?.user.memberId
                        ? "ml-auto bg-blue-600 text-white"
                        : "mr-auto bg-gray-400"
                    }`}
                  >
                    {message.fileUrl && (
                      <img src={message.fileUrl} alt="Sent file" />
                    )}
                    <p>{message.content}</p>
                    <div
                      className={`text-lg absolute top-1/2 hidden -translate-y-1/2 transform p-3 text-black ${
                        message.memberId === session?.user.memberId
                          ? "ll right-[100%] flex items-center justify-end pr-4 mr-[-2px]"
                          : "rr left-[100%] flex items-center pl-4 ml-[-2px]"
                      }`}
                    >
                      <BsTrash 
                      className={`hover:text-zinc-700 ${message.memberId === session?.user.memberId ? "ml-2" : "mr-2"}`} 
                      onClick={() => handleDeleteMessage(message.id)}
                      />                      
                      <small className="block text-xs text-gray-700">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-[50px] flex-shrink-0 pt-2">
            <ChatInput
              senderId={session?.user.memberId}
              conversationId={selectedConversation}
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
