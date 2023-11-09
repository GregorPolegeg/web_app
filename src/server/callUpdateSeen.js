const callSendMessage = async (senderId, conversationId) => {
    if (conversationId && conversationId !== "") {
      try {
        const response = await fetch("http://194.152.0.195:3000/api/chat/setSeenStatus/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId, conversationId }),
        });
  
        if (response.ok) {
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };
  
  module.exports = callSendMessage;
  