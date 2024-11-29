import { NextFunction, Response, Request } from "express";

import prisma from "../../../lib/prisma/init";

export const getFollowersList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.user;
  const take = Number(req.query.take) || 10; // Default value: 10
  const skip = Number(req.query.skip) || 0;  // Default value: 0

  try {
    const followersData = await prisma.user.findUnique({
      where: { id },
      select: {
        followingIds: true,
        followers: {
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
    if (!followersData) {
      return res.status(404).json({ msg: "User not found" });
    }
    const { followingIds, followers } = followersData;

    // Map followers to follower status
    const usersWithFollowStatus = followers.map((user) => ({
      ...user,
      isFollowed: followingIds.includes(user.id),
    }));

    return res.status(200).json(usersWithFollowStatus);
  } catch (e) {
    next(e);
  }
};
