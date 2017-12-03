import { Request, Response } from "express";
import UsageTier, { UsageTierModel } from "./../models/UsageTier";
import { sendErrorResponse } from "../util/util";

export let getUsageTiers = (req: Request, res: Response) => {
    UsageTier.find((err: Error, data: UsageTierModel[]) => {
        if (err) {
            sendErrorResponse(res, err);
        } else {
            res.status(200);
            res.json(data);
        }
    });
};

export let createUsageTier = (req: Request, res: Response) => {
    const name: string = req.body.tierName;
    UsageTier.findOne({tierName: name}, (err: Error, usageTier: UsageTierModel) => {
        if (err) {
            sendErrorResponse(res, err);
        } else {
            if (usageTier) {
                res.status(422);
                res.json({status: "Error", message: "Please add a unique name for usage tier while creating a new tier"});
            } else {
                const usageTier = new UsageTier({
                    tierName: req.body.tierName,
                    tierDisplayName: req.body.tierDisplayName,
                    usage: req.body.usage,
                    uom: req.body.uom
                });
                usageTier.save({}, (err: Error, usageTier: UsageTierModel) => {
                    if (err) {
                        sendErrorResponse(res, err);
                    } else {
                        res.status(200);
                        res.json(usageTier);
                    }
                });
            }
        }
    });
};

export let updateUsageTier = (req: Request, res: Response) => {
    const id: number = req.params.id;
    UsageTier.findById(id, (err: Error, usageTier: UsageTierModel) => {
        if (err) {
            sendErrorResponse(res, err);
        } else {
            if (usageTier) {
                usageTier.tierName = req.body.tierName;
                usageTier.tierDisplayName = req.body.tierDisplayName;
                usageTier.usage = req.body.usage;
                usageTier.uom = req.body.uom;
                usageTier.save({}, (err: Error, usageTier: UsageTierModel) => {
                    if (err) {
                        res.status(422);
                        res.json({status: "Error", message: err.message});
                    } else {
                        res.status(200);
                        res.json(usageTier);
                    }
                });
            } else {
                res.status(404);
                res.send();
            }
        }
    });
};

export let deleteUsageTier = (req: Request, res: Response) => {
    UsageTier.findById(req.params.id, (err: Error, usageTier: UsageTierModel) => {
        if (err) {
            sendErrorResponse(res, err);
        } else {
            if (usageTier) {
                usageTier.remove((err: Error) => {
                    if (err) {
                        sendErrorResponse(res, err);
                    } else {
                        res.status(200);
                        res.send();
                    }
                });
            } else {
                res.status(404);
                res.send();
            }
        }
    });
};