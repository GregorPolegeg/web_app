// ConversationSelector.jsx
import React from 'react';

  type ConversationSelectorProps = {
    selectedConversationName: string;
    setSelectedConversationName: (name: string) => void;
    selectedAge: string;
    setSelectedAge: (age: string) => void;
    selectedGender: string;
    setSelectedGender: (gender: string) => void;
    newConvo: () => void;
  };

  const ConversationSelector: React.FC<ConversationSelectorProps> = ({
  selectedConversationName,
  setSelectedConversationName,
  selectedAge,
  setSelectedAge,
  selectedGender,
  setSelectedGender,
  newConvo,
}) => {
  if (selectedConversationName === "") {
    return (
      <div className="flex">
        <button onClick={() => setSelectedConversationName("Business advice")} className="p-5">
          Business advice
        </button>
        <button onClick={() => setSelectedConversationName("Moral support")} className="p-5">
          Moral support
        </button>
        <button onClick={() => setSelectedConversationName("Relationship advice")} className="p-5">
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
        <button onClick={() => { setSelectedGender("WOMAN"); newConvo(); }} className="p-5">
          girl
        </button>
        <button onClick={() => { setSelectedGender("MAN"); newConvo(); }} className="p-5">
          boy
        </button>
        <button onClick={() => { setSelectedGender("OTHER"); newConvo(); }} className="p-5">
          Don't care
        </button>
      </div>
    );
  } else {
    return null;
  }
};

export default ConversationSelector;
