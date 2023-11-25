import { useSession } from "next-auth/react";
import React from "react";
import { SocketProvider, useSocket } from "../api/providers/socket-provider";
import Subscriptions from "../api/user/components/Subscriptions";
import Feed from "../api/feed/Feed";
const index = () => {
  const { data: session } = useSession();
  const subscriptionPlan = session?.user.subscriptionPlan;

  const { isConnected } = useSocket();

  if (!isConnected) {
    return <></>;
  }
  return (
    <SocketProvider>
      <div className="h-full md:pt-[55px]">
        {subscriptionPlan !== "NONE" ? (
          <Feed></Feed>
        ) : (
          <Subscriptions />
        )}
      </div>
    </SocketProvider>
  );
};

export default index;
