import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  firstName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  accountNumber: string;
  createdAt: Date;
  cardNumber?: string;
cvv?: string;
expiry?: string;
};

const AccountSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  accountNumber: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },


// Virtual Card Info
cardNumber: { type: String, unique: true },
cvv: { type: String },
expiry: { type: String },
});

export default mongoose.model<IAccount>('Account', AccountSchema);

