import { Request, Response } from "express";
import Application, { ApplicationModel } from "./../models/Application";
import ForwardConfig, { ForwardConfigModel } from "../models/ForwardConfig";
import User, { UserModel } from "./../models/User";
import { sendErrorResponse } from "../util/util";
import ApplicationError from "../util/applicationError";
import * as async from "async";

export let getApplications = (req: Request, res: Response) => {
    Application.find()
        .where("user")
        .equals(req.params.uid)
        .populate("user")
        .populate("forwardConfigs")
        .exec()
        .then((applications: ApplicationModel[]) => {
            res.status(200);
            res.json(applications);
        })
        .catch((err: Error) => {
            sendErrorResponse(res, err);
        });
};

export let createApplication = (req: Request, res: Response) => {
    const data: any = {};
    User.findById(req.params.uid)
        .exec()
        .then((user: UserModel) => {
            if (user) {
                data["user"] = user;
                if (!req.body.forwardConfigs || req.body.forwardConfigs.length === 0) {
                    throw new ApplicationError(`At least one forward configuration must be specified for application`, 422);
                }
                const forwardConfigs: Array<ForwardConfigModel> = [];
                req.body.forwardConfigs.forEach((forwardConfig: ForwardConfigModel) => {
                    const fc: ForwardConfigModel = new ForwardConfig();
                    Object.assign(fc, forwardConfig);
                    forwardConfigs.push(fc);
                });
                return ForwardConfig.create(forwardConfigs);
            } else {
                throw new ApplicationError(`User with id ${req.params.uid} not found`, 404);
            }
        })
        .then((forwardConfigs: ForwardConfigModel[]) => {
            const application: ApplicationModel = new Application({
                name: req.body.name,
                user: data["user"],
                forwardConfigs: forwardConfigs
            });
            return application.save()
                .catch((err: Error) => {
                    const fcIds: string[] = [];
                    forwardConfigs.forEach((forwardConfig: ForwardConfigModel) => fcIds.push(forwardConfig._id));
                    ForwardConfig.remove({ _id: { $in : fcIds }})
                        .exec()
                        .then(() => { throw  err; })
                        .catch((err) => { throw err; });
                });
        })
        .then((application: ApplicationModel) => {
            return Application.findById(application._id).populate("forwardConfigs").populate("user").exec();
        })
        .then((application: ApplicationModel) => {
            res.status(200);
            res.json(application);
        })
        .catch((err: Error) => {
            sendErrorResponse(res, err);
        });
};

export let updateApplication = (req: Request, res: Response) => {
    const data: any = {};

    Application.findOne()
        .where("user")
        .equals(req.params.uid)
        .where("_id")
        .equals(req.params.aid)
        .populate("user")
        .populate("forwardConfigs")
        .exec()
        .then((application: ApplicationModel) => {
            if (application) {
                data["application"] = application;
                return processConfigUpdates(application.forwardConfigs, req.body.forwardConfigs);
            } else {
                throw new ApplicationError(`No application found for id ${req.params.aid}`, 404);
            }
        })
        .then((forwardConfigs: ForwardConfigModel[]) => {
            const application: ApplicationModel = data["application"];
            application.name = req.body.name;
            application.forwardConfigs = forwardConfigs;
            return application.save();
        })
        .then((application: ApplicationModel) => {
            return Application.findById(application._id).populate("user").populate("forwardConfigs").exec();
        })
        .then((application: ApplicationModel) => {
            res.status(200);
            res.json(application);
        })
        .catch((err: Error) => {
            sendErrorResponse(res, err);
        });
};

export let deleteApplication = (req: Request, res: Response) => {
    const data: any = {};
    Application.findOne()
        .where("user")
        .equals(req.params.uid)
        .where("_id")
        .equals(req.params.aid)
        .populate("forwardConfigs")
        .exec()
        .then((application: ApplicationModel) => {
            if (!application) throw new ApplicationError(`No application found with id ${req.params.aid}`, 404);
            const fcIds: string[] = [];
            data["application"] = application;
            application.forwardConfigs.forEach((config: ForwardConfigModel) => {
                fcIds.push(config._id);
            });
            return ForwardConfig.remove({_id: { $in: fcIds }});
        })
        .then(() => {
            return data["application"].remove();
        })
        .then(() => {
            res.status(200);
            res.send();
        })
        .catch((err: Error) => {
            sendErrorResponse(res, err);
        });
};


const getForwardConfigCreateList = (requestForwardConfigs: ForwardConfigModel[]) => {
    const createList: ForwardConfigModel[] = [];
    requestForwardConfigs.forEach((forwardConfig: ForwardConfigModel) => {
        if (!forwardConfig.hasOwnProperty("_id")) createList.push(forwardConfig);
    });
    return createList;
};

const getForwardConfigUpdateList = (applicationForwardConfigs: ForwardConfigModel[], requestForwardConfigs: ForwardConfigModel[]) => {
    const updateConfigs: ForwardConfigModel[] = [];
    applicationForwardConfigs.forEach((appForwardConfig: ForwardConfigModel) => {
        requestForwardConfigs.forEach((reqForwardConfig: ForwardConfigModel) => {
           if (reqForwardConfig._id == appForwardConfig._id) {
               Object.assign(appForwardConfig, reqForwardConfig);
               updateConfigs.push(appForwardConfig);
           }
        });
    });
    return updateConfigs;
};

const getForwardConfigDeleteList = (applicationForwardConfigs: ForwardConfigModel[], requestForwardConfigs: ForwardConfigModel[]) => {
    const deleteList: ForwardConfigModel[] = [];
    applicationForwardConfigs.forEach((forwardConfig: ForwardConfigModel) => {
        let found: boolean = false;
       requestForwardConfigs.forEach((el: ForwardConfigModel) => {
            if (el._id == forwardConfig._id) {
                found = true;
            }
       });
       if (!found) deleteList.push(forwardConfig);
    });
    return deleteList;
};

const processConfigUpdates: (applicationForwardConfigs: ForwardConfigModel[], requestForwardConfigs: ForwardConfigModel[]) => Promise<ForwardConfigModel[]> =
    function (afcs: ForwardConfigModel[], rfcs: ForwardConfigModel[]): Promise<ForwardConfigModel[]> {
        return new Promise<ForwardConfigModel[]>((resolve, reject) => {
            async.parallel({
                create: (callback) => {
                    const createList: ForwardConfigModel[] = getForwardConfigCreateList(rfcs);
                    const docs: ForwardConfigModel[] = [];
                    createList.forEach((forwardConfig: ForwardConfigModel) => {
                        const doc: ForwardConfigModel = new ForwardConfig();
                        Object.assign(doc, forwardConfig);
                        docs.push(doc);
                    });
                    if (docs.length === 0) return callback(undefined, []);
                    ForwardConfig.create(docs)
                        .then((configs: ForwardConfigModel[]) => {
                            callback(undefined, configs);
                        })
                        .catch((err: Error) => {
                            callback(err);
                        });
                },
                update: (callback) => {
                    const updateList: ForwardConfigModel[] = getForwardConfigUpdateList(afcs, rfcs);
                    if (updateList.length === 0) return callback(undefined, []);
                    async.map(updateList, (config: ForwardConfigModel, callback) => {
                        config.save()
                            .then((config: ForwardConfigModel) => {
                                callback(undefined, config);
                            })
                            .catch((err: Error) => {
                                callback(err);
                            });
                    }, (err: Error) => {
                        if (err) callback(err);
                        else callback(undefined, updateList);
                    });
                },
                remove: (callback) => {
                    const deleteList: ForwardConfigModel[] = getForwardConfigDeleteList(afcs, rfcs);
                    async.map(deleteList, (config: ForwardConfigModel, callback) => {
                        config.remove()
                            .then(() => {
                                callback();
                            })
                            .catch((err: Error) => {
                                callback(err);
                            });
                    }, (err: Error) => {
                        if (err) callback(err);
                        else callback(undefined, []);
                    });
                }
            }, (err: Error, results) => {
                if (err) reject(new ApplicationError("Error occured updating forward configs", 500));
                else {
                    let configs: ForwardConfigModel[] = [];
                    configs = configs.concat(<ForwardConfigModel[]>results["create"], <ForwardConfigModel[]>results["update"]);
                    resolve(configs);
                }
            });
        });
    };