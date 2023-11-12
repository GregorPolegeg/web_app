import { NextApiRequest, NextApiResponse } from "next";
import { db } from "src/lib/db"; // Import Gender from Prisma client instead of defining it manually.

interface Data {
    memberOneId: string,
    name: string,
    age: string,
    gender: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { memberOneId, name, age, gender } : Data = req.body;

  if (!memberOneId) {
    return res.status(400).json({ message: "No memberOneId provided" });
  }

  try {
    const helpers = await db.user.findMany({
      where: { type: "WORKER" },
      include: { member: true },
    });

    if (!helpers || helpers.length === 0) {
      return res.status(404).json({ message: "No helpers found" });
    }

    const randomIndex = Math.floor(Math.random() * helpers.length);
    const helper = helpers[randomIndex];

    if (!helper || !helper.member || !helper.member[0]) {
      return res
        .status(500)
        .json({ message: "Failed to find a helper with member information" });
    }

    const memberTwoId: string = helper.member[0].id;
    let conversation =
      (await findConversation(memberOneId, memberTwoId)) ||
      (await findConversation(memberTwoId, memberOneId));
    if (!conversation) {
      conversation = await createNewConversation(memberOneId, memberTwoId,name,age,gender);
    }

    if (!conversation) {
      return res
        .status(500)
        .json({ message: "Failed to find or create a conversation" });
    }

    return res.json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
}

const findConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    return await db.conversation.findFirst({
      where: {
        AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
      },
      include: {
        memberOne: {
          include: {
            user: true,
          },
        },
        memberTwo: {
          include: {
            user: true,
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to find conversation: ${error}`);
  }
};

const createNewConversation = async (
  memberOneId: string,
  memberTwoId: string,
  name: string,
  age: string,
  gender: string,
) => {
  try {
    return await db.conversation.create({
      data: {
        memberOneId,
        memberTwoId,
        name,
        age,
        gender,
        updatedAt: new Date(),
      },
      include: {
        memberOne: {
          include: {
            user: true,
          },
        },
        memberTwo: {
          include: {
            user: true,
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to create a new conversation: ${error}`);
  }
};
