import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';

// incase using aws
import AWS from "aws-sdk";

const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION
}

const S3 = new AWS.S3(awsConfig);

// this upload image use for deadling with aws uploading only
export const uploadImage = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).send("No image...");

        // prepare image
        const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), "base64");

        const type = image.split(";")[0].split("/")[1];

        // image params
        const params = {
            Bucket: process.env.BucketName,
            Key: `${nanoid()}.${type}`,
            Body: base64Data,
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: `image/${type}`,
        }

        // upload image
        S3.upload(params, (err, data)=> {
            if (err) {
                console.log(err);
                return res.sendStatus(400);
            }
            res.send(data);
        })
    } catch (error) {
        console.log(error);
    }
}

export const deleteImage = async (req, res) => {
    try {
        const { image } = req.body;
        const params = {
            Bucket: image.Bucket,
            Key: image.Key
        };

        S3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            }
            res.send({ok: true});
        })
    } catch (error) {
        console.log(error)
    }
}

export const uploadVideo = async (req, res) => {
    try {
        const { video } = req.files;
        if (!video) return res.status(400).send('No video')

        // video params
        const params = {
            Bucket: process.env.BucketName,
            Key: `${nanoid()}.${video.type.split("/")[1]}`,
            Body: readFileSync(video.path),
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: video.type,
        }

        // upload image
        S3.upload(params, (err, data)=> {
            if (err) {
                console.log(err);
                return res.sendStatus(400);
            }
            res.send(data);
        })
    } catch (error) {
        console.log(error);
    }
}

export const deleteVideo = async (req, res) => {
    try {
        const { video } = req.body;
        const params = {
            Bucket: video.Bucket,
            Key: video.Key
        };

        S3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            }
            res.send({ok: true});
        })
    } catch (error) {
        console.log(error)
    }
}