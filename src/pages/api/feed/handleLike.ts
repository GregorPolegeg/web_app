import { Post } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { title } from "process";
import { db } from "src/lib/db";
import Like from "./Like";

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
      return res.status(401).json({ message: "No postId" });
    }

    const member = await db.member.findFirst({
      where: { id: memberId },
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

    const checkLike = await db.like.findFirst({
      where: {
        postId: postId,
        memberId: memberId,
      },
    });

    if (checkLike) {
      const deletedLike = await db.like.delete({
        where: {
          id: checkLike.id,
        },
      });
      return res.status(200).json({ message: "Removed like successfully", data: false });
    }

    const newLike = await db.like.create({
      data: {
        postId: postId,
        memberId: memberId,
      },
    });

    if (!Like) {
      return res.status(403).json({ message: "Error adding like" });
    }
    return res
      .status(201)
      .json({ message: "Like successfully created", data: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
