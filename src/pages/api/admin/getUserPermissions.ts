import { db } from "~/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (user?.type === "ADMIN") {
      return res.status(200).json({message: "got it" ,hasPerm: true });
    }

    return res.status(200).json({message: "got it", hasPerm: false });

  } catch (error) {
    return res.status(502).json({ message: "Internal Error" });
  }
}
