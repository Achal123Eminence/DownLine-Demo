import mongoose from 'mongoose';

const userAllocationSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    partnership: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
      max: 100,
    },

    commission: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

userAllocationSchema.index(
  { parentId: 1, childId: 1 },
  { unique: true }
);

userAllocationSchema.index({ parentId: 1 });
userAllocationSchema.index({ childId: 1 });

const UserAllocation = mongoose.model(
  'UserAllocation',
  userAllocationSchema
);

export default UserAllocation;