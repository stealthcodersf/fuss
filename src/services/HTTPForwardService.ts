import { ForwardConfigModel } from "../models/ForwardConfig";
import ForwardService from "./ForwardService";

export default class HTTPForwardService extends ForwardService {

    forwardFiles(files: [string, string][], callback: Function): void {
        callback();
    }
}