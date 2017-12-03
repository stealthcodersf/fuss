import { Request, Response } from "express";
import AntiVirusTier, { AntiVirusTierModel } from "./../models/AntiVirusTier";
import { sendErrorResponse } from "./../util/util";

export let getAntiVirusTiers = (req: Request, res: Response) => {
    AntiVirusTier.find((err: Error, data: AntiVirusTierModel[]) => {
        if (err) {
            sendErrorResponse(res, err);
        } else {
            res.status(200);
            res.json(data);
        }
    });
};

export let createAntiVirusTier = (req: Request, res: Response) => {
    const name: string = req.body.tierName;
    AntiVirusTier.findOne({tierName: name}, (err: Error, antiVirusTier: AntiVirusTierModel) => {
        if (err) {
            sendErrorResponse(res, err);
        } else {
            if (antiVirusTier) {
                res.status(422);
                res.json({status: "Error", message: "Please add a unique name for anti virus tier while creating a new tier"});
            } else {
                const antiVirusTier = new AntiVirusTier({
                    tierName: req.body.tierName,
                    tierDisplayName: req.body.tierDisplayName,
                    antiViruses: req.body.antiViruses
                });
                antiVirusTier.save({}, (err: Error, antiVirusTier: AntiVirusTierModel) => {
                   if (err) {
                       sendErrorResponse(res, err);
                   } else {
                       res.status(200);
                       res.json(antiVirusTier);
                   }
                });
            }
        }
    });
};

export let updateAntiVirusTier = (req: Request, res: Response) => {
  const id: number = req.params.id;
  AntiVirusTier.findById(id, (err: Error, antiVirusTier: AntiVirusTierModel) => {
      if (err) {
          sendErrorResponse(res, err);
      } else {
          if (antiVirusTier) {
            antiVirusTier.tierName = req.body.tierName;
            antiVirusTier.tierDisplayName = req.body.tierDisplayName;
            antiVirusTier.antiViruses = req.body.antiViruses;
            antiVirusTier.save({}, (err: Error, antiVirusTier: AntiVirusTierModel) => {
               if (err) {
                   res.status(422);
                   res.json({status: "Error", message: err.message});
               } else {
                   res.status(200);
                   res.json(antiVirusTier);
               }
            });
          } else {
              res.status(404);
              res.send();
          }
      }
  });
};

export let deleteAntiVirusTier = (req: Request, res: Response) => {
    AntiVirusTier.findById(req.params.id, (err: Error, antiVirusTier: AntiVirusTierModel) => {
       if (err) {
           sendErrorResponse(res, err);
       } else {
           if (antiVirusTier) {
                antiVirusTier.remove((err: Error) => {
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