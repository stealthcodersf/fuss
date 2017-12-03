import { File } from "multiparty";
import ScanResult, { AVResult, ScanResultModel } from "../models/ScanResult";
import Application, { ApplicationModel } from "../models/Application";
import * as async from "async";
import { ForwardConfigModel } from "../models/ForwardConfig";
import ForwardService from "./ForwardService";
import ForwardServiceFactory from "./ForwardServiceFactory";
import User, { UserModel } from "./../models/User";
import Subscription, { SubscriptionModel } from "../models/Subscription";
import { AntiVirusTierModel } from "../models/AntiVirusTier";
import Plan, {PlanModel} from "../models/Plan";
import ScanServiceFactory from "./ScanServiceFactory";
import ScanService from "./ScanService";
import ApplicationError from "../util/applicationError";

export default class UploadService {

    constructor(private appId: string, private files: File[]) {}

    scanFiles(scanResults: ScanResultModel[]): Promise<ScanResultModel[]> {
        return new Promise((resolve, reject) => {
            if (!scanResults || scanResults.length === 0) reject(new Error("Invalid input to scan files function"));
            const files: string [] = scanResults.map((scanResult: ScanResultModel) => { return scanResult.fileName; } );
            this.getAntiVirusTier()
                .then((antiVirusTier: AntiVirusTierModel) => {
                    async.map(antiVirusTier.antiViruses, (antiVirus: string, callback) => {
                        const scanService: ScanService = ScanServiceFactory.getScanService(antiVirus);
                        scanService.scanFiles(files.slice(0), (err: Error, results: any) => {
                           if (err) callback(err);
                           else {
                               Object.keys(results).forEach((property: string) => {
                                   const scanResult: ScanResultModel = scanResults.filter((sr: ScanResultModel) => { return sr.fileName === property; }).pop();
                                   const scans: AVResult[] = scanResult.scans || [];
                                   const avResult: AVResult = { av: antiVirus, result: results[property]};
                                   scans.push(avResult);
                                   scanResult.scans = scans;
                               });
                               callback();
                           }
                        });
                    }, (err: Error) => {
                        if (err) reject(err);
                        else {
                            resolve(scanResults);
                        }
                    });
                })
                .catch((err: Error) => {
                    reject(err);
                });
        });
    }

    createScanResults(): Promise<ScanResultModel[]> {
        return new Promise((resolve, reject) => {
            if (!this.files || this.files.length === 0) {
                const err: Error = new Error("No files specified for scanning");
                reject(err);
            }
            Application.findById(this.appId)
                .then((application: ApplicationModel) => {
                    if (!application) reject(new ApplicationError(`Application config for app id ${this.appId} not found`, 404));
                    const srDocs: ScanResultModel[] = [];
                    this.files.forEach((file: any) => {
                        srDocs.push(new ScanResult({
                            application: application,
                            fileName: file.path,
                            originalFileName: file.originalFilename,
                            fileSize: file.size,
                            scans: [],
                            quarantined: false,
                            forwarded: false,
                            processingErrors: []
                        }));
                    });
                    return ScanResult.create(srDocs);
                })
                .then((scanResults: ScanResultModel[]) => {
                    resolve(scanResults);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    forwardFiles(scanResults: ScanResultModel[]): Promise<ScanResultModel[]> {
        return new Promise((resolve, reject) => {
            // Filter out infected files from being forwarded
            const files: [string, string][] = [];
            const fileNames: string[] = [];
            scanResults.forEach((scanResult: ScanResultModel) => {
                let infected: boolean = false;
                scanResult.scans.forEach((scan: AVResult) => {
                    if (scan.result) infected = true;
                });
                if (!infected) {
                    files.push([scanResult.fileName, scanResult.originalFileName]);
                    fileNames.push(scanResult.fileName);
                }
            });
            if (files.length === 0) resolve(scanResults);
            Application.findById(this.appId)
                .populate("forwardConfigs")
                .then((application: ApplicationModel) => {
                    async.map(application.forwardConfigs, (forwardConfig: ForwardConfigModel, callback) => {
                        const forwardService: ForwardService = ForwardServiceFactory.getForwardService(forwardConfig);
                        forwardService.forwardFiles(files, callback);
                    }, (err: Error) => {
                        if (err) reject(err);
                        scanResults.forEach((scanResult: ScanResultModel) => {
                           if (fileNames.indexOf(scanResult.fileName) != -1) scanResult.forwarded = true;
                        });
                        resolve(scanResults);
                    });
                });
        });
    }

    saveScanResults(scanResults: ScanResultModel[]): Promise<ScanResultModel[]> {
        return new Promise((resolve, reject) => {
           async.map(scanResults, (scanResult: ScanResultModel, callback) => {
                scanResult.save({})
                    .then((scanResult: ScanResultModel) => {
                        callback(undefined, scanResult);
                    })
                    .catch((err: Error) => {
                       callback(err);
                    });
           }, (err: Error, results: ScanResultModel[]) => {
               if (err) reject(err);
               else resolve(results);
           });
        });
    }

    getAntiVirusTier(): Promise<AntiVirusTierModel> {
        return new Promise((resolve, reject) => {
            Application.findById(this.appId)
                .then((application: ApplicationModel) => {
                    if (!application) reject(new Error(`Unknown application with id ${this.appId}`));
                    return User.findById(application.user);
                })
                .then((user: UserModel) => {
                    return Subscription.findOne()
                        .where("user")
                        .equals(user._id)
                        .where("status")
                        .equals("ACTIVE")
                        .populate("plan")
                        .exec();
                })
                .then((subscription: SubscriptionModel) => {
                    if (!subscription) reject(new Error("No active subscriptions found, upload forbidden!"));
                    return Plan.findById(subscription.plan._id).populate("avTier").exec();
                })
                .then((plan: PlanModel) => {
                    resolve(plan.avTier);
                })
                .catch((err: Error) => {
                    reject(err);
                });
        });
    }
}