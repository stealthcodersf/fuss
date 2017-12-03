import * as mongoose from "mongoose";

export type UsageTierModel = mongoose.Document & {
    tierName: string,
    tierDisplayName: string,
    usage: number,
    uom: UsageUOM
};

enum UsageUOM {
    MB = "MB", GB = "GB", TB = "TB"
}

const usageTierSchema = new mongoose.Schema({
    tierName: { type: String, unique: true },
    tierDisplayName: String,
    usage: Number,
    uom: String
}, { timestamps: true });

const UsageTier = mongoose.model<UsageTierModel>("UsageTier", usageTierSchema);
export default UsageTier;