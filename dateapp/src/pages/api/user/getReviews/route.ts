import { NextApiRequest, NextApiResponse } from "next";
import { db } from "src/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const dataFromDb = await db.review.findMany();

    const transformedData = await Promise.all(
      dataFromDb.map(async (item) => {
        const user = await getUserById(item.userId);
        return {
          id: item.id,
          content: item.content,
          ratingSupport: item.ratingSupport,
          ratingPrice: item.ratingPrice,
          ratingQuality: item.ratingQuality,
          userId: item.userId,
          name: user ? user.name : "", 
          date: item.createdAt?.toLocaleString() || "",
        };
      })
    );

    res.status(200).json(transformedData);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getUserById(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
}
