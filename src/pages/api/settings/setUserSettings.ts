import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import sharp from 'sharp';
import { getFileType } from "../chat/getFileType/getFileType";

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
        const userName = Array.isArray(fields.userName)
          ? fields.userName[0]
          : fields.userName;
        const userId: string = Array.isArray(fields.userId)
          ? fields.userId[0]
          : fields.userId;

        if (!userId) {
          return res.status(401).json({ message: "UserId is required" });
        }

        if (!userName) {
          return res.status(401).json({ message: "Name is required" });
        }

        const uploadedFiles = files.image;
        const formidableFiles = Array.isArray(uploadedFiles)
          ? uploadedFiles
          : [uploadedFiles];

        var imagePath = null;

        for (const file of formidableFiles) {
          if (file !== undefined) {
            const fileType = getFileType(file.originalFilename);
            const directoryPath = `public/members/${userId}`;
            await fs.mkdir(directoryPath, { recursive: true });
        
            const dbImagePath = `${directoryPath}/${file.originalFilename}`;
        
            if (fileType === 'image') {
              const compressedImageBuffer = await sharp(await fs.readFile(file.filepath))
                .jpeg({ quality: 80 })
                .toBuffer();
              await fs.writeFile(dbImagePath, compressedImageBuffer);
        
            }
        
            imagePath = `members/${userId}/${file.originalFilename}`;
          }
        }

        const createdMessage = await db.user.update({
            where: {
                id: userId
            },
            data: {
                name: userName,
                profileImage: imagePath,
            }
        });
        return res.status(201).json({
          message: "User settings updated Succesfuly",
          data: createdMessage,
        });
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
