import User from '../users/user.model.js';
import { registerOwner, loginUser } from './auth.service.js';

export const registerOwnerController = async (req, res, next) => {
  try {
    const owner = await registerOwner(req.body);

    return res.status(201).json({
      success: true,
      message: 'Owner registered successfully',
      data: {
        id: owner._id,
        username: owner.username,
        email: owner.email,
        role: owner.role,
        level: owner.level,
        partnership: owner.partnership.toString(),
        commission: owner.commission.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMeController = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
        parentId: user.parentId,
        ancestors: user.ancestors,
        partnership: user.partnership,
        commission: user.commission,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};