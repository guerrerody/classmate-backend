import { NextFunction, Request, Response } from "express";

import prisma from "../../../lib/prisma/init";

export const deletePostById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;

  try {
    // Delete comments associated with the post (TODO: set onDelete: Cascade in schema).
    await prisma.comment.deleteMany({
      where: {
        postId: req.body?.id,
      },
    });
    
    const postsToDelete = await prisma.post.delete({
      where: {
        id: req.body?.id,
        userId: id,
      },
    });
    if (postsToDelete) {
      res.json({ msg: "Post deleted" });
    }
  } catch (e) {
    next(e);
  }
};
