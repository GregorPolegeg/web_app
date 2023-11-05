import { useSession } from "next-auth/react";
import React from "react";
import Subscriptions from "../api/user/components/getSubscriptions";
import DisplayConversationElement from "../api/user/components/displayConversation/displayConversation";
import { SocketProvider, useSocket } from "../api/providers/socket-provider";
const index = () => {
  const { data: session } = useSession();
  const subscriptionPlan = session?.user.subscriptionPlan;

  const { isConnected } = useSocket();

  if (!isConnected) {
    return <></>;
  }
  return (
    <SocketProvider>
      <div className="h-full pt-[65px]">
        {subscriptionPlan !== "NONE" ? (
          <div className="flex h-full">
            Hello this is home click messages
          </div>
        ) : (
          <Subscriptions />
        )}
      </div>
    </SocketProvider>
  );
};

export default index;
