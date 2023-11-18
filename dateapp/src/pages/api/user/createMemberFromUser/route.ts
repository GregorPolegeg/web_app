import { NextApiRequest, NextApiResponse } from "next";
import { db } from "src/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "No user ID",
      });
    }

    const member = await db.user.findFirst({
      where: { id: userId },
      include: { member: true },
    }); 

    if (member?.member[0]?.id == undefined) {
      const newMember = await db.member.create({
        data: {
          userId: userId,
        },
      });
      // Send as a JSON response
      return res.json({
        memberId: newMember.id,
      });
    }else{
      return res.json({ memberId: member.member[0].id});
    }
  }

  // Handle other HTTP methods or send an error response for unsupported methods
  return res.status(405).json({ message: "Method not allowed" });
}
