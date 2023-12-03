export async function getConversationImage(userId: string, conversationId: string) {
  try {
    const response = await fetch("/api/chat/getConversationImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        conversationId,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const {imageUrl} = data; 
      return imageUrl;
    }
  } catch (error) {
    console.error("An error occurred while fetching older messages:", error);
  }
}
