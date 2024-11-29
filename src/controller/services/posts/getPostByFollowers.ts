import { NextFunction, Request, Response } from "express";

import prisma from "../../../lib/prisma/init";

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.user
  try {
    const posts = await prisma.user.findMany({
      where: {
        id
      },
      select: {
        followings: {

        }
      }
    })
    if (posts) {
      return res.json({ posts });
    }
    throw new Error("Error in trying get posts");
  } catch (e) {
    next(e);
  }
};
