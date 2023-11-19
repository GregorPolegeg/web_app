import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import { getFileType } from "./getFileType/getFileType";

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
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }
  const form = new IncomingForm();
  try {
    await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }).then(async (result: any) => {
      const { fields, files } = result;
      
        const senderId: string = Array.isArray(fields.senderId)
          ? fields.senderId[0]
          : fields.senderId;
        const conversationId: string = Array.isArray(fields.conversationId)
          ? fields.conversationId[0]
          : fields.conversationId;
        const active = true;

        if (!senderId) {
          return res.status(401).json({ message: "SenderId is required" });
        }
        if (!conversationId) {
          return res
            .status(402)
            .json({ message: "ConversationID is required" });
        }

        const uploadedFiles = files.audio;
        const formidableFiles = Array.isArray(uploadedFiles)
          ? uploadedFiles
          : [uploadedFiles];

        for (const file of formidableFiles) {
          if (file !== undefined) {
            const fileType = getFileType(file.originalFilename);
            const directoryPath = `public/conversations/${conversationId}`;
            await fs.mkdir(directoryPath, { recursive: true });
            const currentDate = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

            const dbAudioPath = `${directoryPath}/${currentDate}_${file.originalFilename}`;

            if (fileType === "audio") {
                const fileContent = await fs.readFile(file.filepath);
                await fs.writeFile(dbAudioPath, fileContent);
            }

            const createdMessage = await db.directMessage.create({
              data: {
                content: "",
                memberId: senderId,
                conversationId: conversationId,
                fileUrl: `conversations/${conversationId}/${currentDate}_${file.originalFilename}`,
              },
            });

            return res.status(201).json({
              message: "Message successfully created",
              data: createdMessage,
            });
          } else {
            return res.status(403).json({
              message: "No file",
            });
          }
        }

        //Update Seen for the other Member
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
      
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
