import { useEffect, useRef, useState } from "react";
import { ChatInput } from "~/pages/api/chat/chat-input";
import { useSession } from "next-auth/react";
import { useSocket } from "~/pages/api/providers/socket-provider";
import {
  AiOutlineArrowLeft,
  AiOutlineBell,
  AiOutlineStar,
} from "react-icons/ai";
import { useRouter } from "next/router";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import UserNavigation from "~/components/navigation/userNavigation";
import ConversationSelector from "../api/chat/ConversationSelector/ConversationSelector";
import Message from "../api/chat/Message/Message";
import ConversationList from "../api/chat/ConversationList/ConversationList";

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
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >("t");

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(null);
  const [otherMemberName, setOtherMemberName] = useState<string>("");
  const [otherMemberFileUrl, setOtherMemberFileUrl] = useState<string>("");
  const otherMemberId = useRef<string>("");

  const topSentinelRef = useRef(null);
  const router = useRouter();

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
  }, [cursor, topSentinelRef]);

  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    delay: number,
  ): ((...args: Parameters<F>) => void) => {
    let inDebounce: ReturnType<typeof setTimeout>;

    return (...args: Parameters<F>) => {
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  useEffect(() => {
    const handleScroll = async () => {
      if (messageContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          messageContainerRef.current;
        if (Math.abs(scrollHeight - clientHeight + scrollTop) < 100) {
          await loadOldMessages();
        }
      }
    };

    const debouncedHandleScroll = debounce(handleScroll, 100);

    if (messageContainerRef.current) {
      const messageContainer = messageContainerRef.current;
      messageContainer.addEventListener("scroll", debouncedHandleScroll);

      return () => {
        messageContainer.removeEventListener("scroll", debouncedHandleScroll);
      };
    }
  }, [cursor,loadOldMessages]);

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
        otherMemberId.current = data.otherMemberId;
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

  function joinConversation(conversation: string) {
    if (socket) {
      socket.emit("joinConversation", conversation);
      socket.emit("disconnectOnConversation", {
        conversationId: selectedConversation,
        memberId: session?.user.memberId,
      });
      socket.emit("activeOnConversation", {
        conversationId: conversation,
        memberId: session?.user.memberId,
      });
    }
  }

  useEffect(() => {
    if (session) {
      setCursor(null);
      setMessages([]);
      const conversationId = router.query.id as string;
      if (socket) {
        socket.emit("joinConversation", conversationId);
        socket.emit("disconnectOnConversation", {
          conversationId: selectedConversation,
          memberId: session?.user.memberId,
        });
        socket.emit("activeOnConversation", {
          conversationId: conversationId,
          memberId: session?.user.memberId,
        });
        if (conversationId === "t") {
          setSelectedConversation(null);
          setMessages([]);
        } else if (conversationId) {
          setSelectedConversation(conversationId);
          getDirectMessages(conversationId);
        }
      }
    }
  }, [router.query.id, session]);

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
        setMessages((messages) =>
          messages.filter((message) => message.id !== deletedMessageId),
        );
        if (!isContainerFull()) {
          loadOldMessages();
        }
      };
      socket.on("newMessage", handleNewMessage);
      socket.on("messageDeleted", handleMessageDeleted);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messageDeleted", handleMessageDeleted);
      };
    }
  }, [socket, selectedConversation]);

  function onOpenConversation(conversationId: string, fileUrl: string) {
    if (conversationId === "t") setOtherMemberName("");
    router.push(`/messages/${conversationId}`);
    setOtherMemberFileUrl(fileUrl);
  }

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
        <ConversationList
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          onOpenConversation={onOpenConversation}
          joinConversation={joinConversation}
          setOtherMemberFileUrl={setOtherMemberFileUrl}
        />
        <div
          className={`${
            selectedConversation != null ? "flex" : "hidden"
          } h-full w-full flex-col bg-gray-100  pb-5 md:flex md:pt-[65px]`}
        >
          <div className="flex h-[53px] w-full items-center justify-between border-b border-zinc-200 bg-white p-5 shadow-sm">
            {selectedConversation && selectedConversation != "t" ? (
              <>
                <div className="flex items-center ">
                  <button
                    onClick={() => {
                      onOpenConversation("t", "");
                    }}
                  >
                    <AiOutlineArrowLeft className="text-2xl" />
                  </button>
                  <img
                    className="ml-5 mr-3 h-10 w-10 rounded-full object-cover"
                    src={`../${otherMemberFileUrl}`}
                    alt="Logo"
                  />
                  <h2 className="text-xl font-bold">{otherMemberName}</h2>
                </div>
                <div className="no-highlight flex gap-1 rounded-3xl bg-blue-600 text-xl text-white">
                  <button className=" rounded-3xl px-2 py-2 hover:bg-blue-500">
                    <AiOutlineBell />
                  </button>
                  <button className="px-2 py-2 hover:rounded-3xl hover:bg-blue-500">
                    <FaRegMoneyBillAlt />
                  </button>
                  <button className="rounded-3xl px-2 py-2 hover:bg-blue-500">
                    <AiOutlineStar />
                  </button>
                </div>
              </>
            ) : (
              ""
            )}
          </div>
          <div
            ref={topSentinelRef}
            className="flex flex-grow flex-col-reverse overflow-y-auto pl-2"
          >
            {selectedConversation === "t" ? (
              <ConversationSelector />
            ) : (
              <div
                className={`flex flex-grow flex-col-reverse overflow-y-auto`}
                ref={messageContainerRef}
              >
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    messageId={message.id}
                    memberId={message.memberId}
                    messageContent={message.content}
                    fileUrl={message.fileUrl}
                    createdAt={message.createdAt}
                    handleDeleteMessage={handleDeleteMessage}
                  />
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
          <div className=" flex-shrink-0 px-5 pt-2">
            <ChatInput
              senderId={session?.user.memberId}
              conversationId={selectedConversation ? selectedConversation : ""}
              type="conversation"
              otherMemberId={otherMemberId.current}
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
