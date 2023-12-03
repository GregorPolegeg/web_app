import { DirectMessage } from "@prisma/client";
import { db } from "~/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

const MESSAGES_BATCH = 20;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId, conversationId } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID missing" });
    }

    const member = await db.member.findFirst({
      where: {
        userId,
      },
    });

    const foundconversation = await db.conversation.findFirst({
      where: { id: conversationId },
    });

    if (!member) {
      return res.status(401).json({ message: "Member not found" });
    }

    if (!foundconversation) {
      return res.status(401).json({ message: "Conversation not found" });
    }

    if (
      foundconversation.memberOneId != member.id &&
      foundconversation.memberTwoId != member.id
    ) {
      return res.status(405).json({ message: "Access denied" });
    }

    let otherMemberId;

    if (foundconversation.memberOneId === member.id) {
      otherMemberId = foundconversation.memberTwoId;
    } else {
      otherMemberId = foundconversation.memberOneId;
    }

    const otherMember = await db.member.findFirst({
        where:{
            id: otherMemberId,
        },
        include:{
            user:{
                select:{
                    profileImage: true,
                }
            }
        }
    });

    return res.status(200).json({imageUrl: otherMember?.user.profileImage});
    
  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error);
    return res.status(502).json({ message: "Internal Error" });
  }
}
