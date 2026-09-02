import User from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateAccessToken } from '../../utils/jwt.js';

export const registerOwner = async ({ username, email, password }) => {
  const existingOwner = await User.exists({
    role: 'OWNER',
  });

  if (existingOwner) {
    const error = new Error('Owner already exists');
    error.statusCode = 409;

    throw error;
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    const error = new Error('Username or email already exists');
    error.statusCode = 409;

    throw error;
  }

  const passwordHash = await hashPassword(password);

  const owner = await User.create({
    username,
    email,
    passwordHash,

    role: 'OWNER',
    level: 1,

    parentId: null,
    ancestors: [],

    partnership: 100,
    commission: 10,

    isActive: true,
  });

  return owner;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('User account is inactive');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await comparePassword(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);

  return {
    accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      level: user.level,
    },
  };
};