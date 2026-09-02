import JWT from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return JWT.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      level: user.level,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    }
  );
};