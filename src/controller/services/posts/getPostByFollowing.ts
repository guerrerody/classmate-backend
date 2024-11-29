import { NextFunction, Request, Response } from "express";

import prisma from "../../../lib/prisma/init";

export const getPostByFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.user;
  const take = Number(req.query.take) || 10; // Default value: 10
  const skip = Number(req.query.skip) || 0;  // Default value: 0

  try {
    const followedUserIds = await prisma.user.findUnique({
      where: { id },
      select: { followingIds: true },
    });

    if (followedUserIds) {
      const postsByFollowing = await prisma.post.findMany({
        where: {
          OR: [
            {
              userId: {
                in: followedUserIds.followingIds,
              },
            },
            {
              repostUserIds: {
                hasSome: followedUserIds.followingIds,
              },
            },
            {
              likes: {
                some: {
                  userId: {
                    in: followedUserIds.followingIds,
                  },
                },
              },
            },
          ],
        },
        select: {
          likes: {
            select: {
              userId: true,
            },
          },
          createdAt: true,
          postText: true,
          link: {
            select: {
              id: true,
              imageHeight: true,
              imageUri: true,
              imageWidth: true,
              title: true,
            },
          },
          audioTitle: true,
          audioUri: true,
          videoTitle: true,
          id: true,
          videoUri: true,
          photoUri: true,
          videoViews: true,
          userId: true,
          repostUsers: {
            select: {
              id: true,
            },
            where: {
              id: req.user.id,
            },
          },
          user: {
            select: {
              id: true,
              imageUri: true,
              name: true,
              userName: true,
              verified: true,
            },
          },
          photo: {
            select: {
              id: true,
              imageUri: true,
              imageHeight: true,
              imageWidth: true,
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              repostUsers: true,
            },
          },
        },
        orderBy: [{ id: "desc" }],
        take,
        skip,
      });

      if (postsByFollowing) {
        const formattedPosts = postsByFollowing.map(post => ({
          ...post,
          videoViews: post.videoViews ? post.videoViews.toString() : null, // videoViews is BigInt
        }));
        return res.status(200).json({ posts: formattedPosts });
      }
    }
    return res.status(400).json({ msg: "Bad Request" });
  } catch (e) {
    next(e);
  }
};
