import { NextApiRequest, NextApiResponse } from "next";
import { db } from "src/lib/db";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const {
      user,
      data: { content },
      ratings: { support, price, quality }
    } = req.body;
    try {
      // Ensure the request has necessary data
      if (
        user === null ||
        !user ||
        !content ||
        !support ||
        !price ||
        !quality
      ) {
        return res.status(400).json({
          message: "Name, email, and password are required",
        });
      }

      // Check if user has a review
      const existingByUserName = await db.review.findUnique({
        where: { userId: user.id },
      });

      if (existingByUserName) {
        return res.status(409).json({
          user: null,
          message: "You can only make one review",
        });
      }
      //Create review

      const newReview = await db.review.create({
        data: {
          content: content,
          ratingSupport: support,
          ratingPrice: price,
          ratingQuality: quality,
          createdAt: new Date(), 
          user: {
            connect: { id: user.id },
          },
        },
      }); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Something went wrong",
      });
    }
  } else {
    // Handle non-POST methods
    return res.status(405).json({
      message: "Method Not Allowed",
    });
  }
}
