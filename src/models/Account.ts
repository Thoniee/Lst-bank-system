import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  firstName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  accountNumber: string;
  createdAt: Date;
};

const AccountSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  accountNumber: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAccount>('Account', AccountSchema);

