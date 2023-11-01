import { DirectMessage } from "@prisma/client";
import { db } from "~/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

const MESSAGES_BATCH = 20;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure this handler responds to POST requests only
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId, conversationId, cursor } = req.body;

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
          deleted: false  // Add this condition to filter out deleted messages
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
          deleted: false  // Add this condition to filter out deleted messages
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

    if (
      messages.length === MESSAGES_BATCH &&
      messages[MESSAGES_BATCH - 1]?.id
    ) {
      nextCursor = messages[MESSAGES_BATCH - 1]?.id;
    }

    return res.status(200).json({
      items: messages,
      nextCursor,
    });

  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error);
    return res.status(502).json({ message: "Internal Error" });
  }
}
