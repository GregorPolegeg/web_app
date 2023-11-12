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
    const { userId, conversationId, cursor } = req.body;
    const member = await db.member.findFirst({
      where: {
        userId,
      },
    });
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID missing" });
    }

    let messages: DirectMessage[] = [];

    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId,
          deleted: false,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId,
          deleted: false,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
      },
      select: {
        memberOneId: true,
        memberTwoId: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (
      messages.length === MESSAGES_BATCH &&
      messages[MESSAGES_BATCH - 1]?.id
    ) {
      nextCursor = messages[MESSAGES_BATCH - 1]?.id;
    }
    if (member) {
      const seenUpdatePayload =
        conversation.memberOneId === member.id
          ? { seenByMemberOne: true }
          : conversation.memberTwoId === member.id
          ? { seenByMemberTwo: true }
          : null;
      if (seenUpdatePayload) {
        await db.conversation.update({
          where: { id: conversationId },
          data: seenUpdatePayload,
        });
      }
    }

    const otherMemberId = conversation.memberOneId === member?.id
    ?  conversation.memberTwoId 
    : conversation.memberTwoId === member?.id
    ? conversation.memberOneId 
    : "";

    const otherMember = await db.member.findFirst({
      where: {
        id: otherMemberId
      },
      include: {
        user: true,
      }
    })

    const otherMemberName = otherMember?.user.name;



    return res.status(200).json({
      items: messages,
      nextCursor,
      otherMemberName,
      otherMemberId
    });
  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error);
    return res.status(502).json({ message: "Internal Error" });
  }
}
