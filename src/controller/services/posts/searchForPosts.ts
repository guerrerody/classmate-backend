import { NextFunction, Request, Response } from "express";

import prisma from "../../../lib/prisma/init";

export const searchForPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { q } = req.query;
  console.log(">>>> file: searchForPosts.ts ~ q:", q);

  try {
    const posts = await prisma.post.findMany({
      where: {
        postText: { contains: q?.toString(), mode: "insensitive" },
      },
      orderBy: { id: "desc" },
      select: {
        likes: {
          select: {
            userId: true,
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
      take: 15,
    });
    if (posts) {
      const formattedPosts = posts.map(post => ({
        ...post,
        videoViews: post.videoViews ? post.videoViews.toString() : null, // videoViews is BigInt
      }));
      return res.status(200).json({ posts: formattedPosts });
    }
    res.status(404).json({ posts: [], msg: "Not Found" });
  } catch (e) {
    next(e);
  }
};
