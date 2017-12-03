import * as mongoose from "mongoose";
import { ApplicationModel } from "./Application";

export type ScanResultModel = mongoose.Document & {
    application: ApplicationModel,
    fileName: string,
    originalFileName: string,
    scans: AVResult[],
    fileSize: number,
    quarantined: boolean,
    forwarded: boolean,
    processingErrors: string[]
};
export type AVResult = {
    av: string,
    result: boolean
};
const scanResultSchema = new mongoose.Schema({
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    fileName: String,
    originalFileName: String,
    scans: [
        {
            av: String,
            result: Boolean
        }
    ],
    fileSize: Number,
    quarantined: Boolean,
    forwarded: Boolean,
    processingErrors: [String]
}, { timestamps: true });

const ScanResult = mongoose.model<ScanResultModel>("ScanResult", scanResultSchema);
export default ScanResult;