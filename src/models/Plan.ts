import * as mongoose from "mongoose";
import { UsageTierModel } from "./UsageTier";
import { AntiVirusTierModel } from "./AntiVirusTier";

export type PlanModel = mongoose.Document & {
  usageTier: UsageTierModel,
  avTier: AntiVirusTierModel,
  term: number,
  price: number,
  active: boolean
};

const planSchema = new mongoose.Schema({
    usageTier: { type: mongoose.Schema.Types.ObjectId, ref: "UsageTier" },
    avTier: { type: mongoose.Schema.Types.ObjectId, ref: "AntiVirusTier" },
    term: Number,
    price: Number,
    active: Boolean
}, { timestamps: true });

/* Validate if a plan can be saved without violating the unique business key */
planSchema.pre("save", function save(next) {
    const plan = this;
    if (!(plan.isModified("avTier") || plan.isModified("usageTier") || plan.isModified("term"))) { return next(); }
    Plan.find().where("avTier").equals(plan.avTier)
        .where("usageTier").equals(plan.usageTier)
        .where("term").equals(plan.term)
        .where("active").equals(true)
        .where("_id").ne(plan._id)
        .exec((err: Error, results: PlanModel[]) => {
            if (err) return next(err);
            else {
                if (results.length === 0) next();
                else return next(new Error("Unique key validation from Plan failed while saving!"));
            }
        });
});

planSchema.pre("find", function find(next) {
    this.populate("usageTier").populate("avTier");
    next();
});

const Plan = mongoose.model<PlanModel>("Plan", planSchema);
export default Plan;