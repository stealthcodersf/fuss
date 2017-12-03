import * as mongoose from "mongoose";
import { PlanModel } from "./Plan";
import { UserModel } from "./User";

export type SubscriptionModel = mongoose.Document & {
  plan: PlanModel,
  user: UserModel,
  startDate: Date,
  endDate: Date,
  autoRenew: boolean,
  status: SubscriptionStatus
};

enum SubscriptionStatus {
    ACTIVE = "ACTIVE", EXPIRED = "EXPIRED", CANCELED = "CANCELED"
}

const subscriptionSchema = new mongoose.Schema({
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    autoRenew: Boolean,
    status: String
}, { timestamps: true });

const Subscription = mongoose.model<SubscriptionModel>("Subscription", subscriptionSchema);
export default Subscription;