import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { ConversationProps } from "./adminProps";

const index = () => {
  const { data: session } = useSession();
  const [hasPerm, setHasPerm] = useState<Boolean>(false);
  const [conversations, setConversations] = useState<ConversationProps[]>([]);

  useEffect(() => {
    async function getUserRank() {
      if (session) {
        try {
          const response = await fetch("/api/admin/getUserPermissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: session?.user.id,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setHasPerm(data);
          } else {
            console.error("Failed to delete the message.");
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      }
    }
    getUserRank();
  }, [session]);
  useEffect(() => {
    async function getAllConversations() {
      if (session) {
        try {
          const response = await fetch("/api/admin/getAllConversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: session?.user.id,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setConversations(data);
          } else {
            console.error("Failed to delete the message.");
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      }
    }
    getAllConversations();
  }, [hasPerm]);

  if (hasPerm) {
    return (
<></>
    );
  } else {
    return null;
  }
};

export default index;
