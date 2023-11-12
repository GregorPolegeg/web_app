import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
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
      if (fields.message !== undefined) {
        const messageJSON = Array.isArray(fields.message)
          ? fields.message[0]
          : fields.message;
        const senderId: string = Array.isArray(fields.senderId)
          ? fields.senderId[0]
          : fields.senderId;
        const conversationId: string = Array.isArray(fields.conversationId)
          ? fields.conversationId[0]
          : fields.conversationId;
        const active = Array.isArray(fields.active)
          ? fields.active[0] === "true"
          : fields.active === "true";

        const message = JSON.parse(messageJSON ? messageJSON : "").message;
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
            const fileType = getFileType(file.originalFilename);
            const directoryPath = `public/conversations/${conversationId}`;
            await fs.mkdir(directoryPath, { recursive: true });
        
            const dbImagePath = `${directoryPath}/${file.originalFilename}`;
        
            if (fileType === 'image') {
              const compressedImageBuffer = await sharp(await fs.readFile(file.filepath))
                .jpeg({ quality: 80 })
                .toBuffer();
        
              await fs.writeFile(dbImagePath, compressedImageBuffer);
        
            } else if (fileType === 'video') {
              const outputPath = `${directoryPath}/compressed-${file.originalFilename}`;
              ffmpeg(file.filepath)
                .videoCodec('libx264')
                .audioCodec('aac') 
                .size('50%')
                .on('end', async function() {
                  await fs.rename(outputPath, dbImagePath);
                })
                .save(outputPath);
            }
        
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
