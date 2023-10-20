import { useSession } from "next-auth/react";
import React from "react";
import Subscriptions from "../api/user/components/getSubscriptions";
import DisplayConversationElement from "../api/user/components/displayConversation/displayConversation";

const index = () => {
  const { data: session } = useSession();
  const subscriptionPlan = session?.user.subscriptionPlan;

  return (
    <div className="w-full">
      {subscriptionPlan !== "NONE" ? (
        <div className="mt-7 flex h-full w-full">
          <DisplayConversationElement />
        </div>
      ) : (
        <Subscriptions />
      )}
      </div>
  );
};

export default index;
