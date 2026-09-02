import JWT from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = JWT.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      level: decoded.level,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};