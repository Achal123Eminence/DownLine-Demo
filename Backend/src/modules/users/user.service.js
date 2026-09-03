import User from './user.model.js';
import { hashPassword } from '../../utils/password.js';
import mongoose from 'mongoose';

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

    // 1. Get current user
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
      const error = new Error('Your account is inactive');
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

    // 4. Calculate child level and role
    const childLevel = currentUser.level + 1;

    const roleMap = {
      2: 'SUB_ADMIN',
      3: 'ADMIN',
      4: 'AGENT',
    };

    const childRole = roleMap[childLevel];

    if (!childRole) {
      const error = new Error('Invalid child level');
      error.statusCode = 400;
      throw error;
    }

    const childParentId = currentUser._id;

    const childAncestors = [
      ...currentUser.ancestors,
      currentUser._id,
    ];

    // 5. Check username/email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    }).session(session);

    if (existingUser) {
      const error = new Error(
        'Username or email already exists'
      );
      error.statusCode = 409;
      throw error;
    }

    // 6. Find parent's own current allocation

    const parentPartnershipEntry =
      currentUser.partnershipDistribution.find(
        (item) =>
          item.userId.toString() ===
          currentUser._id.toString()
      );

    const parentCommissionEntry =
      currentUser.commissionDistribution.find(
        (item) =>
          item.userId.toString() ===
          currentUser._id.toString()
      );

    if (!parentPartnershipEntry) {
      const error = new Error(
        'Parent partnership distribution not found'
      );
      error.statusCode = 400;
      throw error;
    }

    if (!parentCommissionEntry) {
      const error = new Error(
        'Parent commission distribution not found'
      );
      error.statusCode = 400;
      throw error;
    }

    const availablePartnership =
      parentPartnershipEntry.value;

    const availableCommission =
      parentCommissionEntry.value;

    // 7. Validate partnership

    if (partnership > availablePartnership) {
      const error = new Error(
        `Insufficient partnership. Available: ${availablePartnership}%, requested: ${partnership}%`
      );

      error.statusCode = 400;
      throw error;
    }

    // 8. Validate commission

    if (commission > availableCommission) {
      const error = new Error(
        `Insufficient commission. Available: ${availableCommission}%, requested: ${commission}%`
      );

      error.statusCode = 400;
      throw error;
    }

    // Generate child ID before creating distribution
    const childId = new mongoose.Types.ObjectId();

    // 9. Build partnership distribution

    const childPartnershipDistribution =
      currentUser.partnershipDistribution.map(
        (item) => {
          const isCurrentUser =
            item.userId.toString() ===
            currentUser._id.toString();

          return {
            userId: item.userId,
            value: isCurrentUser
              ? item.value - partnership
              : item.value,
          };
        }
      );

    childPartnershipDistribution.push({
      userId: childId,
      value: partnership,
    });

    // 10. Build commission distribution

    const childCommissionDistribution =
      currentUser.commissionDistribution.map((item) => ({
        userId: item.userId,
        value: item.value,
      }));

    childCommissionDistribution.push({
      userId: childId,
      value: Number(commission.toFixed(2)),
    });

    // 11. Hash password

    const passwordHash = await hashPassword(password);

    // 12. Create child

    const [childUser] = await User.create(
      [
        {
          _id: childId,

          username,
          email,
          passwordHash,

          role: childRole,
          level: childLevel,

          parentId: childParentId,
          ancestors: childAncestors,

          partnership,
          commission,

          partnershipDistribution:
            childPartnershipDistribution,

          commissionDistribution:
            childCommissionDistribution,

          isActive: true,
        },
      ],
      { session }
    );

    // 13. Commit transaction

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