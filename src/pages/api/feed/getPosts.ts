import { Post } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { title } from "process";
import { db } from "src/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: "No memberId" });
    }

    const member = await db.member.findFirst({
      where: { id: memberId },
    });

    if (!member) {
      return res.status(404).json({ message: "Access denied" });
    }

    const posts = await db.post.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    if (!posts || posts.length === 0) {
      return res.status(403).json({ message: "No posts found" });
    }

    const transformedPosts = await getTransformedPosts(posts, memberId);
    return res.json(transformedPosts);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

const getTransformedPosts = async (posts: Post[], memberId: string) => {
  const promises = posts.map(async (post: Post) => {
    const postMember = await db.member.findFirst({
      where: { id: post.memberId },
      include: { user: { select: { name: true, profileImage: true } } },
    });
    const likeCount = await db.like.count({
      where: { postId: post.id },
    });
    const commentCount = await db.comment.count({
      where: { postId: post.id },
    });
    const memberLike = await db.like.findFirst({
      where: {
        postId: post.id,
        memberId: memberId,
      },
    });

    return {
      id: post.id,
      title: post.title,
      image: post.imageUrl,
      description: post.description,
      postUsername: postMember?.user.name,
      postUserProfileImage: postMember?.user.profileImage,
      likeCount,
      commentCount,
      liked: memberLike != null,
    };
  });

  return await Promise.all(promises);
};
