import ForwardService from "./ForwardService";
import * as ftp from "ftp";
import * as async from "async";

export default class FTPForwardService extends ForwardService {

    forwardFiles(files: [string, string][], callback: Function): void {
        const ftpClient = new ftp();

        ftpClient.on("ready", () => {
            ftpClient.cwd(this.config.ftpConfig.path, (err: Error, cwd: string) => {
                if (err) callback(err);
                else {
                    async.map(files, (file: [string, string], fileCallback) => {
                        ftpClient.put(file[0], file[1], (err: Error) => {
                            if (err) fileCallback(err);
                            else fileCallback();
                        });
                    }, (err: Error, data: any) => {
                        ftpClient.end();
                        if (err) callback(err);
                        else callback(undefined, data);
                    });
                }
            });
        });

        ftpClient.connect({
            host: this.config.ftpConfig.host,
            user: this.config.ftpConfig.username,
            password: this.config.ftpConfig.password
        });
    }
}