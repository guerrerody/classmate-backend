import { NextFunction, Response } from "express";
import sharp from "sharp";
import { s3Config } from "../../config/multer/digitalOcean";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, unlink } from "fs";

const SPACES_PATH_PROFILE = `profile/`;

export const profilePhotoUpload = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const photo = req?.file;
  console.log(">>>> file: profilePhotoUpload.ts ~ profilePhotoUpload ~ photo:", photo);
  if (photo?.mimetype === "image/gif") {
    sharp(`./uploads/${photo?.filename}`, { animated: true })
      .gif()
      .resize(300, 300)
      .toFile(
        `./uploads/${photo?.filename.split(".")[0]}-sm.gif`,
        async (err, info) => {
          if (!info) {
            return;
          }
          const filetoUpload = readFileSync(
            `./uploads/${photo?.filename.split(".")[0]}-sm.gif`
          );

          console.log(">>>> file: profilePhotoUpload.ts ~ filetoUpload:", filetoUpload);
          const keyFile = `${SPACES_PATH_PROFILE}${photo?.filename.split(".")[0]}-sm.gif`
          const fileResults: any = await s3Config.send(
            new PutObjectCommand({
              Bucket: process.env.SPACES_NAME as string,
              Key: keyFile,
              Body: filetoUpload,
              ContentType: "image/gif",
           
            })
          );
          console.log(">>>> file: profilePhotoUpload.ts ~ fileRes:", fileResults);
          if (fileResults) {
            req.imageUri = `${process.env.SPACES_ENDPOINT}/${keyFile}`;
            unlink(
              `./uploads/${photo?.filename.split(".")[0]}-sm.gif`,
              (err) => {
                if (err) {
                  console.log("failed to delete from file system");
                }
              }
            );
            unlink(`./uploads/${photo?.filename}`, (err) => {
              if (err) {
                console.log(err,"failed to delete from file system");
              }
            });
            return next();
          }
        }
      );
  } else {
    sharp(`./uploads/${photo?.filename}`)
      .jpeg({ quality: 90 })
      .resize(600, 600)
      .toFile(
        `./uploads/${photo?.filename.split(".")[0]}-sm.jpg`,
        async (err, info) => {
          if (!info) {
            return;
          }
          const filetoUpload = readFileSync(
            `./uploads/${photo?.filename.split(".")[0]}-sm.jpg`
          );
          console.log(">>>> file: profilePhotoUpload.ts ~ filetoUpload:", filetoUpload);
          const keyFile = `${SPACES_PATH_PROFILE}${photo?.filename.split(".")[0]}-sm.jpg`
          const fileResults: any = await s3Config.send(
            new PutObjectCommand({
              Bucket: process.env.SPACES_NAME as string,
              Key: keyFile,
              Body: filetoUpload,
              ContentType: "image/jpeg",
            })
          );
          console.log(">>>> file: profilePhotoUpload.ts ~ fileRes: ", fileResults);
          if (fileResults) {
            req.imageUri = `${process.env.SPACES_ENDPOINT}/${keyFile}`;
            unlink(
              `./uploads/${photo?.filename.split(".")[0]}-sm.jpg`,
              (err) => {
                if (err) {
                  console.log("failed to delete from file system");
                }
              }
            );
            unlink(`./uploads/${photo?.filename}`, (err) => {
              if (err) {
                console.log("failed to delete from file system");
              }
            });
            return next();
          }
        }
      );
  }
};
