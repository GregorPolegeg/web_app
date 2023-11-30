import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(402).json({ message: "Unauthorized" });
    }

    const userInfo = await db.user.findFirst({
        where:{
            id: userId,
        }
    });

    if(!userInfo)
    return res.status(402).json({ message: "User Not found" });

    const parseUserInfo = {
      userName: userInfo.name,
      fileUrl: userInfo.profileImage ?? "/images/avatar_logo.png",
    } 

    return res.status(200).json({ message: "Success" , parseUserInfo});

  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
