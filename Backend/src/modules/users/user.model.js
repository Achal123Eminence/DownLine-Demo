import mongoose from 'mongoose';

const distributionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

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
      enum: ['OWNER', 'SUB_ADMIN', 'ADMIN', 'AGENT'],
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
      ref: 'User',
      default: null,
    },

    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Amount this user received from its parent
    partnership: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Amount this user received from its parent
    commission: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Tracks partnership distribution for THIS user's hierarchy node
    partnershipDistribution: {
      type: [distributionSchema],
      default: [],
    },

    // Tracks commission distribution for THIS user's hierarchy node
    commissionDistribution: {
      type: [distributionSchema],
      default: [],
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

const User = mongoose.model('User', userSchema);

export default User;