import { NextApiRequest, NextApiResponse } from "next";
import { NextApiResponseServerIo } from "types";
import { db } from "~/lib/db";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {

  // Check for HTTP method
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    // Extract input data
    const { data, senderId, conversationId } = req.body;
    const { message } = data;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    if (!senderId) {
      return res.status(401).json({ message: "SenderId is required" });
    }
    if (!conversationId) {
      return res.status(402).json({ message: "ConversationID is required" });
    }

    // Create the message
    const createdMessage = await db.directMessage.create({
      data: {
        content: message,
        memberId: senderId,
        conversationId: conversationId,
      },
    });

    await db.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        updatedAt: new Date()
      }
    });
    


    return res.status(201).json({ message: "Message successfully created", data: createdMessage });

  } catch (error) {
    // Handle errors (database, unexpected, etc.)
    console.error("Error creating message:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
