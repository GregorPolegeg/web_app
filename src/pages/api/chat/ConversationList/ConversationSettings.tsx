import { useSession } from "next-auth/react";
import React, { useState } from "react";

type ConversationSettingsProps = {
  conversationName: string;
  conversationImage: string;
  conversationID: string;
};

const ConversationSettings: React.FC<ConversationSettingsProps> = ({
  conversationName,
  conversationImage,
  conversationID,
}) => {
  const { data: session } = useSession();
  const [newConversationName, setNewConversationName] =
    useState(conversationName);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewConversationName(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/chat/ConversationList/updateConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: session?.user.memberId,
          conversationId: conversationID,
          conversationName: newConversationName,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(":P")
      }
    } catch (error) {
      console.error("An error occurred while fetching older messages:", error);
    }
  };

  return (
    <div className="z-1 fixed inset-0 bg-black bg-opacity-40">
      <div className="flex h-full items-center justify-center">
        <form
          className="no-highlight edit-Contact-Container flex flex-col items-center justify-center gap-5 rounded-xl bg-zinc-300 p-5"
          onSubmit={onSubmit}
        >
          <h1 className="text-2xl font-semibold">Chat Settings</h1>
          <img
            src={`../${conversationImage}`}
            className="max-h-40 max-w-[160px] rounded-full" 
            alt="Preview"
          />

          <input
            type="text"
            className="without-ring rounded-xl bg-zinc-400 p-2"
            maxLength={20}
            defaultValue={conversationName}
            onChange={handleNameChange}
          />
          <button
            type="submit"
            className="mt-3 rounded-xl bg-blue-500 px-4 py-2 text-white"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationSettings;
