import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'owner';
  matchPassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  productName: string;
  productCode: string;
  barcode?: string;
  category: string;
  brand: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
