import { Request, Response } from "express";
import User, { UserModel } from "./../models/User";
import PaymentMethod, { PaymentMethodModel } from "./../models/PaymentMethod";
import { sendErrorResponse } from "../util/util";

export let getPaymentMethods = (req: Request, res: Response) => {
    const uid = req.params.uid;
    PaymentMethod.find()
        .where("user")
        .equals(uid)
        .exec((err: Error, paymentMethods: PaymentMethodModel[]) => {
            if (err) sendErrorResponse(res, err);
            else {
                res.status(200);
                res.json(paymentMethods);
            }
        });
};

export let createPaymentMethod = (req: Request, res: Response) => {
    const uid: string = req.params.uid;
    User.findById(uid, (err: Error, user: UserModel) => {
        if (err) sendErrorResponse(res, err);
        else {
            if (user) {
                const paymentMethod = new PaymentMethod({
                   user: user,
                   name: req.body.name,
                   primary: req.body.primary,
                   type: req.body.type,
                   processor: req.body.processor,
                   processorProperties: req.body.processorProperties
                });
                paymentMethod.save({}, (err: Error, paymentMethod: PaymentMethodModel) => {
                   if (err) sendErrorResponse(res, err);
                   else {
                       res.status(200);
                       res.json(paymentMethod);
                   }
                });
            } else {
                res.status(404);
                res.send();
            }
        }
    });
};

export let updatePaymentMethod = (req: Request, res: Response) => {
    PaymentMethod.find()
        .where("_id")
        .equals(req.params.pmid)
        .where("user")
        .equals(req.params.uid)
        .populate("user")
        .exec((err: Error, paymentMethods: PaymentMethodModel[]) => {
            if (err) sendErrorResponse(res, err);
            else {
                if (paymentMethods.length === 0) {
                    res.status(404);
                    res.send();
                } else {
                    const paymentMethod = paymentMethods[0];
                    paymentMethod.name = req.body.name;
                    paymentMethod.type = req.body.type;
                    paymentMethod.primary = req.body.primary;
                    paymentMethod.processor = req.body.processor;
                    paymentMethod.processorProperties = req.body.processorProperties;
                    paymentMethod.save({}, (err: Error, paymentMethod: PaymentMethodModel) => {
                       if (err) sendErrorResponse(res, err);
                       else {
                           res.status(200);
                           res.json(paymentMethod);
                       }
                    });
                }
            }
        });
};

export let deletePaymentMethod = (req: Request, res: Response) => {
    PaymentMethod.find()
        .where("user")
        .equals(req.params.uid)
        .where("_id")
        .equals(req.params.pmid)
        .exec((err: Error, paymentMethods: PaymentMethodModel[]) => {
            if (err) sendErrorResponse(res, err);
            else {
                if (paymentMethods.length === 1) {
                    paymentMethods[0].remove((err: Error) => {
                       if (err) sendErrorResponse(res, err);
                       else {
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