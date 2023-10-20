import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const { message, sender, conversationID } = req.body;
      if (message == null && sender == null && conversationID == null) {
        return res.status(400).json({
          message: "Message or sender or reciver null",
        });
      }

      const createdMessage = await db.directMassage.create({
        data: {
          content: message,
          memberId: sender,
          conversationId: conversationID,
        }
      })
    } catch (error) {}
  }
}
