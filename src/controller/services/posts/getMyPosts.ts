import { NextFunction, Request, Response } from "express";

import prisma from "../../../lib/prisma/init";

export const getMyPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const take = Number(req.query.take) || 10; // Default value: 10
  const skip = Number(req.query.skip) || 0;  // Default value: 0

  try {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            userId: req.user.id,
          },
          {
            repostUserIds: {
              hasSome: [req.user.id],
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
        photo: {
          select: {
            id: true,
            imageUri: true,
            imageHeight: true,
            imageWidth: true,
          }
        },
        createdAt: true,
        postText: true,
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
        link: {
          select: {
            id: true,
            imageHeight: true,
            imageUri: true,
            imageWidth: true,
            title: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: [{ id: "desc" }],
      take,
      skip,
    });
    if (posts) {
      const formattedPosts = posts.map(post => ({
        ...post,
        videoViews: post.videoViews ? post.videoViews.toString() : null, // videoViews is BigInt
      }));
      return res.status(200).json({ posts: formattedPosts });
    }
  } catch (e) {
    next(e);
  }
};
