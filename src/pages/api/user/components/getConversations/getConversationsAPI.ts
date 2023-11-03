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
    const conversations = await db.conversation.findMany({
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
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        directMessage: {
          where:{
            deleted: false
          },
          take: 1,
          orderBy: {
            updatedAt: 'desc'
          },
          include: {
            member: {
              select: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });
    

    if (!conversations) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }
    const transformedConversations = conversations.map(convo => {
      const directMessage = convo.directMessage[0];
      return {
        id: convo.id,
        name: convo.name, 
        content: '',
        lastMessageUsername: directMessage?.member?.user?.name || null,
        lastMessage: directMessage?.content || null,
        fileUrl: directMessage?.fileUrl || null,
        updatedAt: convo.updatedAt,
        deleted: false,
      };
    });

    

    return res.json(transformedConversations);
  }

  // Handle other HTTP methods or send an error response for unsupported methods
  return res.status(405).json({ message: "Method not allowed" });
}
