import { Request, Response, NextFunction } from "express";

import config from "../../../config/env/";

export const postAudio = (req: Request, res: Response, next: NextFunction) => {
  console.log(">>>> file: postAudio.ts ~ postAudio ~ req: ", req.file);
  const url = req.protocol + "://" + req.get("host");
  if (config.stage === "production") {
    if (req.file && "location" in req.file) {
      return res.send({ audio: req.file.location });
    } else {
      return res.status(400).json({ msg: "Location not found in uploaded file" });
    }
  }
  if (req.file) {
    const path = `${url}/api/pic/${req.file.path.split("\\")[1]}`;
    console.log(">>>> file: index.ts ~ router.post ~ path: ", path);
    res.send({ audio: path });
  } else {
    res.json({ msg: "Error in upload" });
  }
};
