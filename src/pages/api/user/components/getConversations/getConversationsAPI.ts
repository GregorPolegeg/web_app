import { NextApiRequest, NextApiResponse } from "next";
import { db } from "src/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({
        message: "No memberId",
      });
    }
    const conversation = await db.conversation.findMany({
      where: {
        OR: [
          {
            memberOneId: memberId,
          },
          {
            memberTwoId: memberId,
          },
        ],
      },
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.json(conversation);
  }

  // Handle other HTTP methods or send an error response for unsupported methods
  return res.status(405).json({ message: "Method not allowed" });
}
