import { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcrypt";
import { db } from "src/lib/db";

interface RequestBody {
  email: string;
  name: string;
  password: string;
}

const bcrypt = require('bcrypt');


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      // Ensure the request has necessary data
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({
          message: "Name, email, and password are required",
        });
      }

      // Check for existing user by email
      const existingByEmail = await db.user.findUnique({
        where: { email },
      });
      if (existingByEmail) {
        return res.status(409).json({
          user: null,
          message: "User with this email already exists",
        });
      }

      // Check for existing user by name
      const existingByUserName = await db.user.findFirst({
        where: { name },
      });
      if (existingByUserName) {
        return res.status(409).json({
          user: null,
          message: "User with this username already exists",
        });
      }
      //Create user
      const hashedPassword = await hash(password, 10);

      const newUser = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          type: "NORMAL",
          platformType: "NORMAL",
        },
      });
      const newMember = await db.member.create({
        data:{
          userId: newUser.id,
        }

      });
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(200).json({
        user: userWithoutPassword,
        message: "User created successfully",
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
