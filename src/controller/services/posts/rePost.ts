import { NextFunction, Response, Request } from "express";

import prisma from "../../../lib/prisma/init";

export const rePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repostUserId = await prisma.post.findUnique({
      where: {
        id: req.query.id as string,
      },
      select: {
        repostUserIds: true,
      },
    });
    if (repostUserId?.repostUserIds.includes(req.user.id)) {
      const postToAdd = await prisma.post.update({
        where: {
          id: req.query.id as string,
        },
        data: {
          repostUsers: {
            disconnect: {id: req.user.id},
          },
        },
      });

      if (postToAdd) {
        return res.status(200).json({ msg: "repost removed" });
      }
      return res.status(400).json({ msg: "failed" });
    } else {
      const postToAdd = await prisma.post.update({
        where: {
          id: req.query.id as string,
        },
        data: {
          repostUsers: {
            connect: {id: req.user.id},
          },
        },
      });
      if (postToAdd) {
        return res.status(200).json({ msg: "successfully reposted" });
      }
      return res.status(400).json({ msg: "failed" });
    }
  } catch (e) {
    next(e);
  }
};
