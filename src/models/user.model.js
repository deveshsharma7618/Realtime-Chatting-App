import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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
    contacts : {
      type : [String],
      default : [],
      required : false,
    }
  },
  { timestamps: true }
);

// Index for fast lookups
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
