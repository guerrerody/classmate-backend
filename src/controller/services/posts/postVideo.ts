import { Request, Response, NextFunction } from "express";
import ffmpeg from "fluent-ffmpeg";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";

import { s3Config } from "../../../config/multer/digitalOcean";

const SPACES_PATH_POST = `post/`;

export const postVideo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  console.log(">>>> file: postVideo.ts ~ postVideo ~ req:", req.file);
  try {
    const videoKey: string = req.file.key;
    console.log(">>>> file: postVideo.ts ~ postVideo ~ videoKey:", videoKey);
    const videoPresignedUrl = await getSignedUrl(
      s3Config,
      new GetObjectCommand({
        Bucket: process.env.SPACES_NAME as string,
        Key: `${SPACES_PATH_POST}${videoKey}`,
      })
    );

    const screenshotBuffer: any = await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPresignedUrl)
        .screenshots({
          timestamps: ["50%"], // Take a screenshot at 50% of the video's duration
          filename: `${videoKey.split(".")[0]}.jpg`,
          folder: "screenshots", // Optional: Folder within the S3 bucket
        })
        .on("end", () => {
          const screenshotData = fs.readFileSync(`./screenshots/${videoKey.split(".")[0]}.jpg`);
          console.log(">>>> file: postVideo.ts ~ .on ~ screenshotData:", screenshotData);
          resolve(screenshotData);
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    const screenshotUploadResult: any = await s3Config.send(
      new PutObjectCommand({
        Bucket: process.env.SPACES_NAME as string,
        Key: "screenshots/" + videoKey.split(".")[0] + "-screenshot.jpg",
        Body: screenshotBuffer,
        ContentType: "image/jpeg",

      })
    );
    console.log(">>>> file: postVideo.ts ~ postVideo ~ screenshotUploadResult:", screenshotUploadResult);
    if (screenshotUploadResult) {
      return res.send({
        video: req.file?.location,
        thumbNail: `${process.env.SPACES_ENDPOINT}/screenshots/${videoKey.split(".")[0]}-screenshot.jpg`,
      });
    }
  } catch (e) {
    next(e);
  }
  return res.send({
    video: req.file?.location,
  });
};
