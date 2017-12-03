import { Response } from "express";
import ApplicationError from "./applicationError";
import * as uuid from "uuid";

export let sendErrorResponse = (res: Response, err: Error) => {
    if (err instanceof ApplicationError) {
        res.status(err.statusCode);
    } else {
        res.status(500);
    }
    res.json({status: "Error", message: err.message});
};

export let getUuid = () => {
    return uuid.v1();
};