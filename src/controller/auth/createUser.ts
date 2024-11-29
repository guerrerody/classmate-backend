import { NextFunction, Request, Response } from "express";

import prisma from "../../lib/prisma/init";
import { createHashedPassword } from "../../middleware/auth";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    name,
    email,
    password,
    userName,
  }: { name: string; email: string; password: string; userName: string } = req.body;

  const formattedUserName = userName.trim().toLowerCase();
  try {

    // Validate if the email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(401).json({ msg: "Email already in use" });
    }

    // Validate if the username already exists
    const existingUserName = await prisma.user.findUnique({
      where: { userName: formattedUserName },
    });

    if (existingUserName) {
      return res.status(401).json({ msg: "Username already in use" });
    }


    const user = await prisma.user.create({
      data: {
        name,
        password: await createHashedPassword(password),
        email,
        userName: formattedUserName,
      },
    });

    if (user) {
      return res.status(200).json({ msg: "Account created" });
    }
    return res.status(400).json({ msg: "error" });
  } catch (error: any) {
    next(error);
  }
}
