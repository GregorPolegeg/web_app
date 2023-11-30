import { Comment } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "src/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { memberId, postId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: "No memberId" });
    }
    if (!postId) {
      return res.status(400).json({ message: "No postId" });
    }

    const member = await db.member.findFirst({
      where: { id: memberId },
    });

    const post = await db.post.findFirst({
      where: {
        id: postId,
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Access denied" });
    }

    if (!post) {
      return res.status(404).json({ message: "Access denied" });
    }

    const comments = await db.comment.findMany({
      where: {
        postId: postId,
      },
      orderBy: [{ createdAt: "desc" }],
    });

    if (!comments || comments.length === 0) {
      return res.status(403).json({ message: "No comments found" });
    }

    const transformedPosts = await getTransformedPosts(comments);
    return res.json(transformedPosts);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

const getTransformedPosts = async (comments: Comment[]) => {
  const promises = comments.map(async (comment: Comment) => {
    const member = await db.member.findFirst({
      where: {
        id: comment.memberId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    return {
      id: comment.id,
      userName: member?.user.name,
      comment: comment.text,
      postId: comment.postId,
    };
  });

  return await Promise.all(promises);
};
