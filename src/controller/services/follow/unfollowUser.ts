import { NextFunction, Response, Request } from "express";

import prisma from "../../../lib/prisma/init";
import updateFollowerCounts from "../../../modules/socket/updateFollows";

export const unfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id; // Current user ID
  const unfollowId = req.query.id as string; // ID of the user to unfollow

  console.log(">>>> file: unfollowUser.ts ~ unfollowUser ~ userId: ", userId);
  console.log(">>>> file: unfollowUser.ts ~ unfollowUser ~ unfollowId: ", unfollowId);

  // Validate req.query.id
  if (!unfollowId || typeof unfollowId !== "string") {
    return res.status(400).json({ msg: "Invalid or missing 'id' parameter" });
  }

  try {
    const userWithFollower = await prisma.user.update({
      where: { id: userId },
      data: {
        followings: {
          disconnect: {
            id: unfollowId,
          },
        },
      },
    });

    if (userWithFollower) {
      const results = await Promise.allSettled([
        updateFollowerCounts(userId),
        updateFollowerCounts(unfollowId),
      ]);
      // Log the results of follower updates
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          console.log(`Update follower counts for user ${index === 0 ? userId : unfollowId} succeeded`);
        } else {
          console.error(`Update follower counts for user ${index === 0 ? userId : unfollowId} failed: `, result.reason);
        }
      });
    }
    return res.status(200).json({ msg: "unfollowed" });
  } catch (e) {
    next(e);
  }
};
