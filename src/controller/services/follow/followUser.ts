import { NextFunction, Response, Request } from "express";
import Expo from "expo-server-sdk";

import prisma from "../../../lib/prisma/init";
import updateFollowerCounts from "../../../modules/socket/updateFollows";
import expo from "../../../lib/expo/init";
import { handleNotifications } from "../../../modules/handleNotifications";

export const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, email } = req.user;
  const followId = req.query.id as string; // User ID to follow

  console.log(">>>> file: followUser.ts ~ followUser ~ id: ", id);
  if (!followId || typeof followId !== "string") {
    return res.status(400).json({ msg: "Invalid or missing 'id' parameter" });
  }

  if (id === followId) {
    return res.status(200).json({ msg: "can't follow self" });
  }
  try {
    const [user, followedUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: { followingIds: true, notificationId: true },
      }),
      prisma.user.findUnique({
        where: { id: followId },
        select: { followingIds: true, notificationId: true },
      }),
    ]);

    if (user?.followingIds.includes(followId)) {
      await prisma.user.update({
        where: { id },
        data: {
          followings: {
            disconnect: {
              id: followId,
            },
          },
        },
      });

      await Promise.allSettled([
        updateFollowerCounts(id),
        updateFollowerCounts(followId),
      ]);

      return res.status(200).json({ msg: "unfollowed" });
    } else {
      await prisma.user.update({
        where: { id },
        data: {
          followings: {
            connect: {
              id: followId,
            },
          },
        },
      });

      handleNotifications(
        `@${email} just followed you`,
        followId,
        "Follow",
        undefined,
        undefined,
        id
      );
      // Sends push notification if followings is less than 9 or multiples of 10
      if (
        (followedUser?.followingIds?.length || 0) + 1 <= 9 ||
        ((followedUser?.followingIds?.length || 0) + 1) % 10 === 0
      ) {
        if (Expo.isExpoPushToken(followedUser?.notificationId)) {
          await expo.sendPushNotificationsAsync([
            {
              to: followedUser?.notificationId as string,
              sound: "default",
              title: `+1 Follow`,
              body: `@${email} just followed you`,
              subtitle: "followed you",
            },
          ]);
        }
      }

      await Promise.allSettled([
        updateFollowerCounts(id),
        updateFollowerCounts(followId),
      ]);

      return res.status(200).json({ msg: "followed" });
    }
  } catch (e) {
    next(e);
  }
};
