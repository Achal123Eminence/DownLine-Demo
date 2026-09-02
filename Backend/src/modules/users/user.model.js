import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["OWNER", "SUB_ADMIN", "ADMIN", "USER"],
      required: true,
    },

    level: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    partnership: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      min: 0,
      max: 100,
    },

    commission: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      min: 0,
      max: 100,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ parentId: 1 });
userSchema.index({ ancestors: 1 });
userSchema.index({ level: 1 });
userSchema.index({ parentId: 1, level: 1 });

const User = mongoose.model("User", userSchema);
export default User;