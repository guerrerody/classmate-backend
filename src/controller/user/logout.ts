import { Request, Response } from "express";

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ msg: "Failed to destroy session" });
    }
    res.json({ msg: "done" });
  });
};
