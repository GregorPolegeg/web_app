import { useEffect, useState } from "react";
import { ChatInput } from "~/pages/api/chat/chat-input";
import { useSession } from "next-auth/react";
import { BsTrash } from "react-icons/bs";

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

const DisplayConversationElement = () => {
  const { data: session } = useSession();
  const [selectedConversation, setSelectedcConversation] = useState<string>("");
  const [conversations, setConversations] = useState<Data[] | null>(null);
  
  async function newConvo() {
    try {
      const response = await fetch("/api/user/getOrCreateConversation/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberOneId: session?.user.memberId }),
      });
      if (response.ok) {
      } else {
        console.error("Failed to create conversation", response);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  useEffect(() => {
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
  }, [session?.user.id]);

  if (session?.user.memberId) {
    return (
      <div className="">
        {conversations === null ? (
          <div>Loading...</div>
        ) : conversations.length === 0 ? (
          <div>No conversations</div>
        ) : (
          <div className="mt-2 h-full w-full border-gray-300 bg-gray-50 md:w-[400px] md:border-r">
            <h2 className="mt-2 p-2 text-center text-xl font-bold">Messages</h2>
            <div>
              {conversations.map((conversation: Data) => (
                <div
                  key={conversation.id}
                  className="py flex w-full items-center justify-between border-y border-gray-300 px-2 py-3"
                >
                  <button className="flex flex-col" onClick={() => setSelectedcConversation(conversation.id)}>
                    <h1 className="pl-2 text-left">{conversation.name}</h1>
                    <div className="pl-2">
                      <p className="text-base font-[500]">
                        {conversation.content}
                      </p>
                      <p className="p text-xs text-gray-500">
                        kdo: Last message - 13h
                      </p>
                    </div>
                  </button>
                  <div className="text-base">
                    <button>
                      <BsTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <ChatInput
          senderId={session?.user.memberId}
          conversationId={selectedConversation}
          type="conversation"
        />
        <button onClick={() => newConvo()}>Create Convo</button>
      </div>
    );
  } else {
    <div>Loading...</div>;
  }
};

export default DisplayConversationElement;
