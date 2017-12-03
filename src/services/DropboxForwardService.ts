import ForwardService from "./ForwardService";
import Dropbox = require("dropbox");
import * as async from "async";
import * as fs from "fs";

export default class DropboxForwardService extends ForwardService {

    forwardFiles(files: [string, string][], callback: Function): void {
        const dropbox = new Dropbox({accessToken: this.config.dropboxConfig.accessToken});
        async.map(files, (file: [string, string], callback) => {
            const buffer: Buffer = fs.readFileSync(file[0]);
            dropbox.filesUpload({path: "/" + this.config.dropboxConfig.folder + "/" + file[1], contents: buffer})
                .then((data: any) => { callback(undefined, data); })
                .catch((err: Error) => { callback(err); });
        }, (err: Error, data: any) => {
           if (err) callback(err);
           else callback(undefined, data);
        });
    }
}