import { Request, Response } from "express";
import Plan, { PlanModel } from "../models/Plan";
import { sendErrorResponse } from "../util/util";

export let getPlans = (req: Request, res: Response) => {
    Plan.find().populate("avTier").populate("usageTier").exec((err: Error, results: PlanModel[]) => {
       if (err) {
           sendErrorResponse(res, err);
       } else {
           res.status(200);
           res.json(results);
       }
    });
};

export let createPlan = (req: Request, res: Response) => {
    Plan.find({usageTier: req.body.usageTier._id, avTier: req.body.avTier._id, term: req.body.term, active: true},
        (err: Error, results: PlanModel[]) => {
        if (err) {
            sendErrorResponse(res, err);
        } else {
            if (results.length == 0) {
                const plan = new Plan({
                    usageTier: req.body.usageTier,
                    avTier: req.body.avTier,
                    term: req.body.term,
                    price: req.body.price,
                    active: req.body.active
                });
                plan.save({}, (err: Error, plan: PlanModel) => {
                    if (err) {
                        sendErrorResponse(res, err);
                    } else {
                        plan.populate("usageTier")
                            .populate("avTier")
                            .populate((err: Error, plan: PlanModel) => {
                                if (err) {
                                    sendErrorResponse(res, err);
                                } else {
                                    res.status(200);
                                    res.json(plan);
                                }
                            });
                    }
                });
            } else {
                res.status(422);
                res.json({status: "Error", message: "Plan already exists for the same usage tier, anti virus tier and term"});
            }
        }
    });
};

export let updatePlan = (req: Request, res: Response) => {
    Plan.findById(req.params.id, (err: Error, plan: PlanModel) => {
       if (err) sendErrorResponse(res, err);
       else {
           if (!plan) {
               res.status(404);
               res.send();
               return;
           }
           plan.usageTier = req.body.usageTier;
           plan.avTier = req.body.avTier;
           plan.term = req.body.term;
           plan.price = req.body.price;
           plan.active = req.body.active;
           plan.save({}, (err: Error, plan: PlanModel) => {
              if (err) sendErrorResponse(res, err);
              else {
                  Plan.findById(req.params.id)
                      .populate("avTier")
                      .populate("usageTier")
                      .exec((err: Error, plan: PlanModel) => {
                      if (err) sendErrorResponse(res, err);
                      else {
                          res.status(200);
                          res.json(plan);
                      }
                  });
              }
           });
       }
    });
};

export let deletePlan = (req: Request, res: Response) => {
    Plan.findById(req.params.id, (err: Error, plan: PlanModel) => {
       if (err) sendErrorResponse(res, err);
       else {
           if (!plan) {
               res.status(404);
               res.send();
           } else {
               plan.remove((err: Error) => {
                  if (err) sendErrorResponse(res, err);
                  else {
                      res.status(200);
                      res.send();
                  }
               });
           }
       }
    });
};