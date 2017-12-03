import { ForwardConfigModel } from "../models/ForwardConfig";

export default abstract class ForwardService {
    constructor(protected config: ForwardConfigModel) {}
    abstract forwardFiles(files: [string, string][], callback: Function): void;
}