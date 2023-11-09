import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";
import { IncomingForm } from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: "Error processing the form" });
      }
      if (fields.message !== undefined) {
        const messageJSON = Array.isArray(fields.message)
          ? fields.message[0]
          : fields.message;
        const senderId = Array.isArray(fields.senderId)
          ? fields.senderId[0]
          : fields.senderId;
        const conversationId = Array.isArray(fields.conversationId)
          ? fields.conversationId[0]
          : fields.conversationId;
        const active = Array.isArray(fields.active)
          ? fields.active[0]
          : fields.active;

        const message = JSON.parse(messageJSON ? messageJSON : "").message;

        if (!message) {
          return res.status(400).json({ message: "Message is required" });
        }
        if (!senderId) {
          return res.status(401).json({ message: "SenderId is required" });
        }
        if (!conversationId) {
          return res
            .status(402)
            .json({ message: "ConversationID is required" });
        }

        const uploadedFiles = files.image;
        const formidableFiles = Array.isArray(uploadedFiles)
          ? uploadedFiles
          : [uploadedFiles];

        var imagePath = null;

        for (const file of formidableFiles) {
          if (file !== undefined) {
            const directoryPath = `public/conversations/${conversationId}`;
            await fs.mkdir(directoryPath, { recursive: true });
            const dbImagePath = `${directoryPath}/${file.originalFilename}`;
            await fs.writeFile(dbImagePath, await fs.readFile(file.filepath));
            imagePath = `conversations/${conversationId}/${file.originalFilename}`;
          }
        }

        const createdMessage = await db.directMessage.create({
          data: {
            content: message,
            memberId: senderId,
            conversationId: conversationId,
            fileUrl: imagePath,
          },
        });

        const conversation = await db.conversation.findFirst({
          where: {
            id: conversationId,
          },
        });
        if (!active) {
          await db.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              updatedAt: new Date(),
              ...(senderId === conversation?.memberOneId
                ? { seenByMemberTwo: false }
                : { seenByMemberOne: false }),
            },
          });
        } else {
          await db.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              updatedAt: new Date(),
            },
          });
        }

        return res.status(201).json({
          message: "Message successfully created",
          data: createdMessage,
        });
      }
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
