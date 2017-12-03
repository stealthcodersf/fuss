import * as mongoose from "mongoose";
import { UserModel } from "./User";
import { ForwardConfigModel } from "./ForwardConfig";
import { getUuid } from "../util/util";

export type ApplicationModel = mongoose.Document & {
    name: string,
    appKey: string,
    user: UserModel,
    forwardConfigs: ForwardConfigModel[]
};

const applicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    appKey: { type: String, unique: true },
    forwardConfigs: [{ type: mongoose.Schema.Types.ObjectId, ref: "ForwardConfig"}],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

/* Generate App Id and App Key when saving new object */
applicationSchema.pre("save", function save(next) {
    const application = this;
    if (!application.isNew) { return next(); }
    application.appKey = getUuid();
    next();
});

const Application = mongoose.model<ApplicationModel>("Application", applicationSchema);
export default Application;