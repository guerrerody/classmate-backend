import { Request, Response, NextFunction } from "express";

import prisma from "../../lib/prisma/init";

export const getGuest = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.query.id as string;

  try {
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        followingIds: true,
      },
    });
    if (!loggedInUser) {
      return res.json({ error: "error" });
    }
    const isFollowed = loggedInUser.followingIds.includes(id);
    console.log(">>>> file: getGuest.ts ~ getGuest ~ isFollowed: ", isFollowed)
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        followers: true,
        userName: true,
        followersCount: true,
        followingCount: true,
        email: true,
        followings: true,
        verified: true,
        imageUri: true,
        emailIsVerified: true,
      },
    });
    if (user) {
      const {
        email,
        userName,
        imageUri,
        emailIsVerified,
        name,
        verified,
        followersCount,
        followingCount,
      } = user;
      return res.status(200).send({
        data: {
          email,
          userName,
          imageUri,
          emailIsVerified,
          verified,
          name,
          followersCount: followersCount?.toString(),
          followingCount: followingCount?.toString(),
          isFollowed,
        },
      });
    }
    res.status(404).json({ msg: "user doesnot exist" });
  } catch (e) {
    next(e);
  }
};
