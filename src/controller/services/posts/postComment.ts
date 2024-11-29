import { NextFunction, Response, Request } from "express";

import prisma from "../../../lib/prisma/init";

export const postComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { comment, id } = req.body;
  try {
    const commentPost = await prisma.comment.create({
      data: {
        comment,
        postId: id,
        userId: req.user.id,
      },
    });
    console.log(">>>> file: postComment.ts ~ commentPost:", commentPost)
    if (comment) {
      return res.json({ msg: "commented" });
    }
  } catch (e) {
    next(e);
  }
};
