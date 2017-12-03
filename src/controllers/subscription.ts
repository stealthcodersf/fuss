import { Request, Response } from "express";
import User, { UserModel } from "./../models/User";
import Subscription, { SubscriptionModel } from "../models/Subscription";
import { sendErrorResponse } from "../util/util";
import ApplicationError from "../util/applicationError";

export let getSubscriptions = (req: Request, res: Response) => {
    Subscription.find()
        .where("user")
        .equals(req.params.uid)
        .populate("user")
        .populate("plan")
        .exec((err: Error, subscriptions: SubscriptionModel) => {
           if (err) sendErrorResponse(res, err);
           else {
               res.status(200);
               res.json(subscriptions);
           }
        });
};

export let createSubscription = (req: Request, res: Response) => {
    User.findById(req.params.uid, (err: Error, user: UserModel) => {
       if (err) sendErrorResponse(res, err);
       else {
           if (user) {
                const subscription = new Subscription({
                    user: user,
                    plan: req.body.plan,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    autoRenew: req.body.autoRenew,
                    status: req.body.status
                });
                subscription.save({}, (err: Error, subscription: SubscriptionModel) => {
                   if (err) sendErrorResponse(res, err);
                   else {
                       res.status(200);
                       res.json(subscription);
                   }
                });
           } else {
               res.status(404);
               res.send();
           }
       }
    });
};

export let updateSubscription = (req: Request, res: Response) => {
    Subscription.find()
        .where("_id")
        .equals(req.params.sid)
        .where("user")
        .equals(req.params.uid)
        .populate("user")
        .exec((err: Error, subscriptions: SubscriptionModel[]) => {
            if (err) sendErrorResponse(res, err);
            else {
                if (subscriptions.length === 1) {
                    const subscription = subscriptions[0];
                    subscription.plan = req.body.plan;
                    subscription.status = req.body.status;
                    subscription.autoRenew = req.body.autoRenew;
                    subscription.startDate = req.body.startDate;
                    subscription.endDate = req.body.endDate;
                    subscription.save({}, (err: Error, subscription: SubscriptionModel) => {
                        if (err) sendErrorResponse(res, err);
                        else {
                            res.status(200);
                            res.json(subscription);
                        }
                    });
                } else {
                    res.status(404);
                    res.send();
                }
            }
        });
};

export let deleteSubscription = (req: Request, res: Response) => {
    Subscription.find()
        .where("user")
        .equals(req.params.uid)
        .where("_id")
        .equals(req.params.sid)
        .exec()
        .then((subscriptions: SubscriptionModel[]) => {
            if (subscriptions.length === 0) {
                throw new ApplicationError(`No Subscription found with id ${req.params.sid}`, 404);
            } else {
                return subscriptions[0].remove();
            }
        })
        .then(() => {
            console.log("In the second promise");
            res.status(200);
            res.send();
        })
        .catch((err: Error) => {
            sendErrorResponse(res, err);
        });
};