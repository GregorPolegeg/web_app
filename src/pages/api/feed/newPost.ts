import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/lib/db";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
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
      if (fields.memberId !== undefined && fields.title !== undefined && (fields.description !== undefined || fields.image !== undefined))  {
        
        const memberId: string = Array.isArray(fields.memberId)
          ? fields.memberId[0]
          : fields.memberId;
          const title: string = Array.isArray(fields.title)
          ? fields.title[0]
          : fields.title;
          const description: string = Array.isArray(fields.description)
          ? fields.description[0]
          : fields.description;

        if (!memberId) {
          return res.status(401).json({ message: "MemberID is required" });
        }
        if (!title) {
          return res
            .status(402)
            .json({ message: "Title is required" });
        }

        const uploadedFiles = files.image;
        const formidableFiles = Array.isArray(uploadedFiles)
          ? uploadedFiles
          : [uploadedFiles];

        var imagePath = null;

        for (const file of formidableFiles) {
          if (file !== undefined) {
            const fileType = getFileType(file.originalFilename);
            const directoryPath = `public/posts/${memberId}`;
            await fs.mkdir(directoryPath, { recursive: true });
        
            const dbImagePath = `${directoryPath}/${file.originalFilename}`;
        
            if (fileType === 'image') {
              const compressedImageBuffer = await sharp(await fs.readFile(file.filepath))
              .rotate() 
              .withMetadata({ orientation: 1 }) 
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
        
            imagePath = `posts/${memberId}/${file.originalFilename}`;
          }
        }

        const member = await db.member.findFirst({
            where: {
                id: memberId,
            },
        })

        if(!member) {
            return res.status(403).json({ message: "MemberID is required!!" });
        }

        const createdPost = await db.post.create({
          data: {
            memberId: memberId,
            title: title,
            imageUrl: imagePath??null,
            description: description??null,
          },
        });

        return res.status(201).json({
          message: "Post successfully created",
          data: createdPost,
        });
      }

    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
