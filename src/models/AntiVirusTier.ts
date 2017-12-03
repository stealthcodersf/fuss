import * as mongoose from "mongoose";

export type AntiVirusTierModel = mongoose.Document & {
  tierName: string,
  tierDisplayName: string,
  antiViruses: AntiViruses[]
};

export enum AntiViruses { ClamAV = "ClamAV", Avast = "Avast", Kaspersky = "Kaspersky" }

const antiVirusTierSchema = new mongoose.Schema({
    tierName: { type: String, unique: true },
    tierDisplayName: String,
    antiViruses: [String]
}, { timestamps: true });

const AntiVirusTier = mongoose.model<AntiVirusTierModel>("AntiVirusTier", antiVirusTierSchema);
export default AntiVirusTier;