import { Response, Request } from "express";

import config from "../../../config/env/";

export const postPhoto = (req: Request, res: Response) => {
  console.log(">>>> file: postPhoto.ts ~ postPhoto ~ req:", req.files);
  const url = req.protocol + "://" + req.get("host");

  if (Array.isArray(req.files))
    if (req.files?.length > 0) {
      if (config.stage === "production") {
        const firstFile = req.files[0];
        if ("location" in firstFile) {
          return res.send({ photo: (firstFile as { location?: string }).location });
        } else {
          return res.status(400).json({ msg: "Location not found in uploaded file" });
        }
      }

      const path = req.files.map(
        (file) => `${url}/api/pic/${file.path.split("\\")[1]}`
      );
      console.log(">>>> file: index.ts ~ router.post ~ path: ", path);

      res.send({ photo: path[0] });
    } else {
      res.json({ msg: "Error in upload" });
    }
};
