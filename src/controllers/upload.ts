import { Request, Response } from "express";
import * as multiparty from "multiparty";
import * as util from "util";
import UploadService from "../services/UploadService";
import { ScanResultModel } from "../models/ScanResult";
import {getScanResults} from "./scanResult";

export let processUpload = (req: Request, res: Response) => {
    const form = new multiparty.Form({
        "autoFiles": true,
        "uploadDir": process.env.UPLOAD_DIR
    });

    form.parse(req, (err: Error, fields: any, files: any) => {
        const uploadSvc: UploadService = new UploadService(req.params.aid, files.upload);
        uploadSvc.createScanResults()
            .then((scanResults: ScanResultModel[]) => {
                return uploadSvc.scanFiles(scanResults);
            })
            .then((scanResults: ScanResultModel[]) => {
                return uploadSvc.forwardFiles(scanResults);
            })
            .then((scanResults: ScanResultModel[]) => {
                return uploadSvc.saveScanResults(scanResults);
            })
            .then((scanResults: ScanResultModel[]) => {
                res.status(200);
                res.send(JSON.stringify(scanResults));
            })
            .catch((err) => {
                res.status(500);
                res.send("Got error while scanning files " + err);
            });
    });
};

export let getUpload = (req: Request, res: Response) => {
    res.render("upload/upload", {});
};