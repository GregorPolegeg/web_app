import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }
  try {
    const { memberId, conversationId, conversationName } = req.body;
    if (!memberId || !conversationId || !conversationName) {
      res.status(400).json({ message: "Invalid parametes" });
      return;
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
      },
    });
    if (conversation?.memberOneId != memberId && conversation?.memberTwoId != memberId) {
      res.status(402).json({ message: "Access denied" });
      return;
    }

    const updatedConversation = await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        name: conversationName,
      },
    });

    res.status(402).json({ message: "Updated" });
    return;
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
