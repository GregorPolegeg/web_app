import { NextApiRequest, NextApiResponse } from "next";
import { db } from "src/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { memberId, postId, comment } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: "No memberId" });
    }
    if (!comment) {
      return res.status(400).json({ message: "No comment body" });
    }

    if (!postId) {
      return res.status(401).json({ message: "No postId" });
    }

    const member = await db.member.findFirst({
      where: { id: memberId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const post = await db.post.findFirst({
      where: { id: postId },
    });

    if (!member) {
      return res.status(404).json({ message: "Access denied" });
    }

    if (!post) {
      return res.status(404).json({ message: "Access denied" });
    }

    const newComment = await db.comment.create({
      data: {
        memberId: memberId,
        text: comment,
        postId: postId,
      },
    });

    if (!newComment) {
      return res.status(404).json({ message: "Action failed" });
    }

    return res.status(201).json({
      message: "Like successfully created",
      data: {
        id: newComment.id,
        userName: member.user.name,
        comment: newComment.text,
        postId: newComment.postId,
      },
    });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
