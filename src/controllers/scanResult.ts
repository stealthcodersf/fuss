import { Request, Response } from "express";
import ScanResult, { ScanResultModel } from "../models/ScanResult";
import Application, { ApplicationModel } from "../models/Application";
import ApplicationError from "../util/applicationError";
import { sendErrorResponse } from "../util/util";

export let getScanResults = (req: Request, res: Response) => {
    Application.findOne()
        .where("user")
        .equals(req.params.uid)
        .where("_id")
        .equals(req.params.aid)
        .exec()
        .then((application: ApplicationModel) => {
            if (!application) throw new ApplicationError(`No application found for id ${req.params.aid}`, 404);
            return ScanResult.find()
                .where("application")
                .equals(application._id)
                .exec();
        })
        .then((scanResults: ScanResultModel[]) => {
            res.status(200);
            res.json(scanResults);
        })
        .catch((err: Error) => {
            sendErrorResponse(res, err);
        });
};

export let deleteScanResult = (req: Request, res: Response) => {
    ScanResult.findById(req.params.srid)
        .then((scanResult: ScanResultModel) => {
            if (!scanResult) throw new ApplicationError(`Scan Result with id ${req.params.srid} not found`, 404);
            return scanResult.remove();
        })
        .then(() => {
            res.status(200);
            res.send();
        })
        .catch((err: Error) => {
            sendErrorResponse(res, err);
        });
};