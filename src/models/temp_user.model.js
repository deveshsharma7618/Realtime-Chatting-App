import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema(
  {
    profile_photo : {
      type: String,
      default: '',
      required:false,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    status: {
      type: String,
      enum: ['unverified', 'verified', 'closed'],
      default: 'unverified',
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpiresAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

// Index for fast lookups
tempUserSchema.index({ email: 1 });

export default mongoose.model('TempUser', tempUserSchema);
