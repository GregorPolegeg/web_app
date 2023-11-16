// ConversationSelector.jsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ConversationSelector = () => {
  const {data: session} = useSession();

  const [selectedConversationName, setSelectedConversationName] =
    useState<string>("");
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const router = useRouter();
  
  async function newConvo() {
    try {
      const response = await fetch("/api/user/getOrCreateConversation/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberOneId: session?.user.memberId,
          name: selectedConversationName,
          age: selectedAge,
          gender: selectedGender,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedAge("");
        setSelectedConversationName("");
        setSelectedGender("");
        router.push(data.id);
      } else {
        console.error("Failed to create conversation", response);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  if (selectedConversationName === "") {
    return (
      <div className="flex">
        <button
          onClick={() => setSelectedConversationName("Business advice")}
          className="p-5"
        >
          Business advice
        </button>
        <button
          onClick={() => setSelectedConversationName("Moral support")}
          className="p-5"
        >
          Moral support
        </button>
        <button
          onClick={() => setSelectedConversationName("Relationship advice")}
          className="p-5"
        >
          Relationship advice
        </button>
      </div>
    );
  } else if (selectedAge === "") {
    return (
      <div>
        <button onClick={() => setSelectedAge("1")} className="p-5">
          20-35
        </button>
        <button onClick={() => setSelectedAge("2")} className="p-5">
          35-50
        </button>
        <button onClick={() => setSelectedAge("3")} className="p-5">
          50-70
        </button>
      </div>
    );
  } else if (selectedGender === "") {
    return (
      <div>
        <button
          onClick={() => {
            setSelectedGender("WOMAN");
            newConvo();
          }}
          className="p-5"
        >
          girl
        </button>
        <button
          onClick={() => {
            setSelectedGender("MAN");
            newConvo();
          }}
          className="p-5"
        >
          boy
        </button>
        <button
          onClick={() => {
            setSelectedGender("OTHER");
            newConvo();
          }}
          className="p-5"
        >
          Don't care
        </button>
      </div>
    );
  } else {
    return null;
  }
};

export default ConversationSelector;
