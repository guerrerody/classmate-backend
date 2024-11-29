import { S3Client } from "@aws-sdk/client-s3";

const SpacesBucketName = process.env.SPACES_NAME as string;

const s3Config = new S3Client({
    forcePathStyle: false,
    region: process.env.SPACES_REGION as string,
    credentials: {
        accessKeyId: process.env.SPACES_KEY as string,
        secretAccessKey: process.env.SPACES_SECRET as string
    }
})

enum SPACES_ACL {
    PUBLIC_READ = 'public-read'
}

export {
    s3Config,
    SpacesBucketName,
    SPACES_ACL,
}