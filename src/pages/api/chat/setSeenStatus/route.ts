import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const { senderId, conversationId } = req.body;
    if (!senderId) {
      return res.status(401).json({ message: "SenderId is required" });
    }
    if (!conversationId) {
      return res.status(402).json({ message: "ConversationID is required" });
    }

    const foundconversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
      },
    });
    if (!foundconversation) {
      return res.status(402).json({ message: "No coversation found" });
    }

    await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
        ...(senderId === foundconversation?.memberOneId
          ? { seenByMemberTwo: false }
          : { seenByMemberOne: false }),
      },
    });
  } catch (e) {}
}
