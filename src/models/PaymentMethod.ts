import * as mongoose from "mongoose";
import { UserModel } from "./User";

export type PaymentMethodModel = mongoose.Document & {
    user: UserModel,
    name: string,
    primary: boolean,
    type: PaymentType,
    processor: PaymentProcessor,
    processorProperties: ProcessorProperty[]
};

enum PaymentType { DEBIT_CARD = "DEBIT_CARD", CREDIT_CARD = "CREDIT_CARD", PAYPAL = "PAYPAL" }

enum PaymentProcessor { STRIPE = "STRIPE", PAYPAL = "PAYPAL" }

type ProcessorProperty = {
  name: string,
  value: string
};

const paymentMethodSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    primary: Boolean,
    type: String,
    processor: String,
    processorProperties: [
        {
            name: String,
            value: String
        }
    ]
}, { timestamps: true });

const PaymentMethod = mongoose.model<PaymentMethodModel>("PaymentMethod", paymentMethodSchema);
export default PaymentMethod;