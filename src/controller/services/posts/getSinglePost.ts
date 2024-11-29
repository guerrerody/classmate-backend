import { NextFunction, Request, Response } from "express";

import prisma from "../../../lib/prisma/init";

export const getSinglePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.query.id as string;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
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
          },
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
    });
    if (post) {
      const formattedPost = {
        ...post,
        videoViews: post.videoViews ? post.videoViews.toString() : null, // videoViews is BigInt
      };
      return res.status(200).json({ posts: formattedPost });
    }
  } catch (e) {
    next(e);
  }
};
