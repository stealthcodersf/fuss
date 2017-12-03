import S3ForwardService from "./S3ForwardService";
import DropboxForwardService from "./DropboxForwardService";
import FTPForwardService from "./FTPForwardService";
import HTTPForwardService from "./HTTPForwardService";
import ForwardService from "./ForwardService";
import { ForwardConfigModel, ForwardConfigType } from "../models/ForwardConfig";

export default class ForwardServiceFactory {

    static getForwardService(config: ForwardConfigModel): ForwardService {
        switch (config.type) {
            case ForwardConfigType.S3 :
                return new S3ForwardService(config);
            case ForwardConfigType.DROPBOX :
                return new DropboxForwardService(config);
            case ForwardConfigType.FTP :
                return new FTPForwardService(config);
            case ForwardConfigType.HTTP :
                return new HTTPForwardService(config);
            default :
                throw new Error("Unsupported forward configuration");
        }
    }
}
