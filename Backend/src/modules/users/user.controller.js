import { createChildUser, getMyDownline, getUserDownline } from './user.service.js';

export const createUserController = async (
  req,
  res,
  next
) => {
  try {
    const user = await createChildUser({
      currentUserId: req.user.userId,

      username: req.body.username,
      email: req.body.email,
      password: req.body.password,

      partnership: req.body.partnership,
      commission: req.body.commission,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
        parentId: user.parentId,
        ancestors: user.ancestors,
        partnership: user.partnership.toString(),
        commission: user.commission.toString(),
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDownlineController = async (
  req,
  res,
  next
) => {
  try {
    const users = await getMyDownline(req.user.userId);

    return res.status(200).json({
      success: true,
      data: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
        parentId: user.parentId,
        ancestors: user.ancestors,
        partnership: user.partnership.toString(),
        commission: user.commission.toString(),
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDownlineController = async (
  req,
  res,
  next
) => {
  try {
    const users = await getUserDownline({
      currentUserId: req.user.userId,
      targetUserId: req.params.userId,
    });

    return res.status(200).json({
      success: true,
      data: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
        parentId: user.parentId,
        ancestors: user.ancestors,
        partnership: user.partnership.toString(),
        commission: user.commission.toString(),
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};