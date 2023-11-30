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
    if(post.memberId !== memberId){
        return res.status(404).json({ message: "Access denied" });
    }

    const deletedPost = await db.post.delete({
        where:{
            id: postId
        }
    })

      return res.status(200).json({ message: "Post removed successfully", data: {postId: deletedPost.id} });
    }

                                                             
  return res.status(405).json({ message: "Method not allowed" });
}
