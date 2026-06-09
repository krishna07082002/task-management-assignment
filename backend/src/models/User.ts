/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

type UserDocument = IUser & Document;

interface UserModel extends Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).password;
        return ret;
      },
    },
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    // agar password change nahi hua
    if (!this.isModified("password")) return next();

    // safety check (TS fix)
    if (!this.password) return next(new Error("Password is required"));

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);

    next();
  } catch (err) {
    next(err as Error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by email (includes password)
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password');
};

const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export default User;
