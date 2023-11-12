import { useSession } from "next-auth/react";
import React from "react";
import { SocketProvider, useSocket } from "../api/providers/socket-provider";
import Subscriptions from "../api/user/components/Subscriptions";
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
            <div className="h-[100px] w-[100px] bg-teal-100"></div>
            <div className="h-[100px] w-[100px] bg-red-950"></div>
            <div className="h-[100px] w-[100px] bg-cyan-800"></div>
            <div className="h-[100px] w-[100px] bg-red-200"></div>
          </div>
        ) : (
          <Subscriptions />
        )}
      </div>
    </SocketProvider>
  );
};

export default index;
