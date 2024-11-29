import { NextFunction, Request, Response } from "express";

import prisma from "../../../lib/prisma/init";

export const like = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.query.id as string;
  console.log(">>>> file: likePost.ts:6 ~ like ~ id: ", id);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
        likes: {
          some: {
            postId: id,
          },
        },
      },
    });
    console.log(">>>> file: likePost.ts ~ like ~ user: ", user);

    if (!user) {
      const posts = await prisma.like.create({
        data: {
          user: { connect: { id: req.user.id } },
          post: { connect: { id } },
        },
      });
      if (posts) return res.status(200).json({ msg: "liked" });
    } else {
      const likeToDelete = await prisma.like.findFirst({
        where: {
          userId: req.user.id,
          postId: id,
        },
      });
      console.log(">>>> file: likePost.ts ~ like ~ likeToDelete: ", likeToDelete);

      if (!likeToDelete) {
        throw new Error("Like not found");
      }
      const deletePost = await prisma.like.delete({
        where: {
          id: likeToDelete.id,
        },
      });
      if (deletePost) {
        return res.status(200).json({ msg: "unliked" });
      }
    }
  } catch (e) {
    next(e);
  }
};
