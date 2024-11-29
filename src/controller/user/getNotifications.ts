import { Request, Response, NextFunction } from "express";

import prisma from "../../lib/prisma/init";

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        notifUser: {
          select: {
            userName: true,
            imageUri: true,
            id: true,
            name: true,
            verified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (notifications) {
      return res.status(200).json({ notifications });
    }
  } catch (e) {
    next(e);
  }
};
