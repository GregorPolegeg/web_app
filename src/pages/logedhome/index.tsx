import { useSession } from "next-auth/react";
import React from "react";
import Subscriptions from "../api/user/components/getSubscriptions";
import DisplayConversationElement from "../api/user/components/displayConversation/displayConversation";

const index = () => {
  const { data: session } = useSession();
  const subscriptionPlan = session?.user.subscriptionPlan;

  return (
    <div className="h-full pt-[72px]">
      {subscriptionPlan !== "NONE" ? (
        <div className="flex h-full">
          <DisplayConversationElement />
        </div>
      ) : (
        <Subscriptions />
      )}
      </div>
  );
};

export default index;
