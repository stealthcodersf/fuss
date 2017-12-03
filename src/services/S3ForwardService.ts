import ForwardService from "./ForwardService";
import * as AWS from "aws-sdk";
import * as async from "async";
import * as fs from "fs";

export default class S3ForwardService extends ForwardService {

    forwardFiles(files: [string, string][], callback: Function): void {
        const s3 = new AWS.S3({
            accessKeyId: this.config.s3Config.accessKeyId,
            secretAccessKey: this.config.s3Config.secretAccessKey});

        async.map(files, (file: [string, string], callback) => {
            const buffer: Buffer = fs.readFileSync(file[0]);
            s3.putObject({
                Bucket: this.config.s3Config.bucket,
                Key: file[1],
                ACL: "public-read",
                Body: buffer,
                ContentLength: buffer.byteLength
            }, (err: Error) => {
                if (err) callback(err);
                else callback();
            });
        }, (err: Error) => {
            if (err) callback(err);
            else callback();
        });
    }
}