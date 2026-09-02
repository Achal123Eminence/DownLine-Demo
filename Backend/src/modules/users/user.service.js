import User from './user.model.js';
import { hashPassword } from '../../utils/password.js';
import mongoose from 'mongoose';
import UserAllocation from './user-allocation.model.js';

export const createChildUser = async ({
  currentUserId,
  username,
  email,
  password,
  partnership,
  commission,
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Get the current user from database

    const currentUser = await User.findById(currentUserId)
      .select('+passwordHash')
      .session(session);

    if (!currentUser) {
      const error = new Error('Authenticated user not found');
      error.statusCode = 401;
      throw error;
    }

    // 2. Check account status

    if (!currentUser.isActive) {
      const error = new Error(
        'Your account is inactive'
      );

      error.statusCode = 403;
      throw error;
    }

    // 3. Level 4 cannot create another user

    if (currentUser.level >= 4) {
      const error = new Error(
        'You are not allowed to create another user'
      );

      error.statusCode = 403;
      throw error;
    }

    // 4. Calculate child's hierarchy information

    const childLevel = currentUser.level + 1;

    const roleMap = {
      2: 'SUB_ADMIN',
      3: 'ADMIN',
      4: 'USER',
    };

    const childRole = roleMap[childLevel];

    const childParentId = currentUser._id;

    const childAncestors = [
      ...currentUser.ancestors,
      currentUser._id,
    ];

    // 5. Check username/email

    const existingUser = await User.findOne({
      $or: [
        { username },
        { email },
      ],
    }).session(session);

    if (existingUser) {
      const error = new Error(
        'Username or email already exists'
      );

      error.statusCode = 409;
      throw error;
    }

    // 6. Calculate parent's allocated amounts

    const allocations = await UserAllocation.find({
      parentId: currentUser._id,
    }).session(session);

    let allocatedPartnership = 0;
    let allocatedCommission = 0;

    for (const allocation of allocations) {
      allocatedPartnership += Number(
        allocation.partnership.toString()
      );

      allocatedCommission += Number(
        allocation.commission.toString()
      );
    }

    const ownedPartnership = Number(
      currentUser.partnership.toString()
    );

    const ownedCommission = Number(
      currentUser.commission.toString()
    );

    const availablePartnership =
      ownedPartnership - allocatedPartnership;

    const availableCommission =
      ownedCommission - allocatedCommission;

    // 7. Validate requested partnership

    if (partnership > availablePartnership) {
      const error = new Error(
        `Insufficient partnership. Available: ${availablePartnership}%, requested: ${partnership}%`
      );

      error.statusCode = 400;
      throw error;
    }

    // 8. Validate requested commission

    if (commission > availableCommission) {
      const error = new Error(
        `Insufficient commission. Available: ${availableCommission}%, requested: ${commission}%`
      );

      error.statusCode = 400;
      throw error;
    }

    // 9. Hash password

    const passwordHash = await hashPassword(password);

    // 10. Create child user

    const [childUser] = await User.create(
      [
        {
          username,
          email,
          passwordHash,

          role: childRole,
          level: childLevel,

          parentId: childParentId,
          ancestors: childAncestors,

          partnership,
          commission,

          isActive: true,
        },
      ],
      { session }
    );

    // 11. Create allocation record

    await UserAllocation.create(
      [
        {
          parentId: currentUser._id,
          childId: childUser._id,

          partnership,
          commission,
        },
      ],
      { session }
    );

    // 12. Commit transaction

    await session.commitTransaction();

    return childUser;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getMyDownline = async (currentUserId) => {
  const users = await User.find({
    parentId: currentUserId,
  })
    .select(
      'username email role level parentId ancestors partnership commission isActive createdAt'
    )
    .sort({ createdAt: -1 });

  return users;
};

export const getUserDownline = async ({
  currentUserId,
  targetUserId,
}) => {
  const currentUser = await User.findById(currentUserId);

  if (!currentUser) {
    const error = new Error('Authenticated user not found');
    error.statusCode = 401;
    throw error;
  }

  if (!currentUser.isActive) {
    const error = new Error('Your account is inactive');
    error.statusCode = 403;
    throw error;
  }

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check whether target belongs to current user's down-line.

  const isInDownline = targetUser.ancestors.some(
    (ancestorId) =>
      ancestorId.toString() === currentUser._id.toString()
  );

  if (!isInDownline) {
    const error = new Error(
      'You are not authorized to access this user'
    );

    error.statusCode = 403;
    throw error;
  }

  // Get target user's direct children

  const users = await User.find({
    parentId: targetUser._id,
  })
    .select(
      'username email role level parentId ancestors partnership commission isActive createdAt'
    )
    .sort({ createdAt: -1 });

  return users;
};