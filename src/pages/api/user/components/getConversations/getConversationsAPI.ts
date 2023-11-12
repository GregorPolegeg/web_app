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
      let seen = false;
      if (convo.memberOneId === memberId) {
        seen = convo.seenByMemberOne;
      } else if (convo.memberTwoId === memberId) {
        seen = convo.seenByMemberTwo;
      }


      return {
        id: convo.id,
        name: convo.name, 
        content: '',
        lastMessageUsername: directMessage?.member?.user?.name || null,
        lastMessage: directMessage?.content ?  (directMessage?.content) : (directMessage?.fileUrl ? "image" : null),
        fileUrl: directMessage?.fileUrl || null,
        updatedAt: convo.updatedAt,
        deleted: false,
        seen,
      };
    });

    

    return res.json(transformedConversations);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
