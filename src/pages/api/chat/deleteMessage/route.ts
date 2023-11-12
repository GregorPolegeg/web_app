import { DirectMessage } from "@prisma/client";
import { db } from "~/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId, conversationId, messageId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID missing" });
    }

    if (!messageId) {
      return res.status(400).json({ message: "Message ID missing" });
    }

    await db.directMessage.update({
      where: { id: messageId },
      data: { deleted: true },
    });

    return res.status(200).json({ message: "Message marked as deleted successfully." });

  } catch (error) {
    console.log("[DIRECT_MESSAGES_DELETE]", error);
    return res.status(502).json({ message: "Internal Error" });
  }
}
