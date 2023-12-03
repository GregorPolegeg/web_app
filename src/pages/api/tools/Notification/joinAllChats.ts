import { Conversation } from "@prisma/client";

import { Session } from "next-auth";
import { Socket } from "socket.io-client";

export async function joinConversation(
  conversationId: string,
  session: Session | null,
  socket: Socket | undefined,
) {
  if (socket && session?.user) {
    socket.emit("joinConversation", conversationId);
    socket.emit("activeOnConversation", {
      conversationId: conversationId,
      memberId: session?.user.memberId,
    });
    socket.emit("disconnectOnConversation", {
      conversationId: conversationId,
      memberId: session?.user.memberId,
    });
  }
}

export async function getConversations(
  session: Session | null,
  socket: Socket | undefined,
) {
  if (session && socket) {
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
        const data: Conversation[] = await response.json();
        data.forEach((conversation) => {
          joinConversation(conversation.id, session, socket);
        });
      } else {
        console.error("Failed to get conversations", response);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
}
