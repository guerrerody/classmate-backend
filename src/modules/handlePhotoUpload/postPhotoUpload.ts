import { NextFunction, Response, Request } from "express";
import imageSize from "image-size";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, unlink } from "fs";

import { s3Config } from "../../config/multer/digitalOcean";

const SPACES_PATH_POST = `post/`;

export const postPhotoUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const photo = req?.file;
  console.log(">>>> file: postPhotoUpload.ts ~ photo:", photo);
  if (!photo) {
    return res.status(400).json({ msg: "upload failed" });
  }
  imageSize(`./uploads/${photo?.filename}`, async (err, dimensions) => {
    const filetoUpload = readFileSync(`./uploads/${photo?.filename}`);
    console.log(">>>> file: profilePhotoUpload.ts ~ filetoUpload:", filetoUpload);
    const keyFile = `${SPACES_PATH_POST}${photo?.filename}`
    const fileResults: any = await s3Config.send(
      new PutObjectCommand({
        Bucket: process.env.SPACES_NAME as string,
        Key: keyFile,
        Body: filetoUpload,
        ContentType: "image/jpeg",
      })
    );
    console.log(">>>> file: postPhotoUpload.ts ~ fileRes:", fileResults);
    if (fileResults) {
      unlink(`./uploads/${photo?.filename}`, (err) => {
        if (err) {
          console.log("failed to delete from file system");
        }
      });
      const image = {
        uri: `${process.env.SPACES_ENDPOINT}/${keyFile}`,
        width: dimensions?.width,
        height: dimensions?.height,
      };

      if (err) {
        return res.status(400).json({ msg: "upload failed" });
      }
      console.log(">>>> file: postPhotoUpload.ts ~ imageSize ~ image:", image)
      return res.json({ photo: image });
    }
    return res.json({ msg: "upload failed" });
  });
};
