import { NextFunction, Request, Response } from "express";

import prisma from "../../../lib/prisma/init";

export const getFollowingList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.user;
  const take = Number(req.query.take) || 10; // Default value: 10
  const skip = Number(req.query.skip) || 0;  // Default value: 0

  try {
    const followingData = await prisma.user.findUnique({
      where: { id },
      select: {
        followings: {
          select: {
            id: true,
            name: true,
            userName: true,
            imageUri: true,
            verified: true,
          },
          take,
          skip,
        },
      },
    });
    if (!followingData) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.status(200).json(followingData.followings || []);
  } catch (e) {
    next(e);
  }
};
