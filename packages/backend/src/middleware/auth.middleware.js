import jwt from 'jsonwebtoken';

const extractToken = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

export const authMiddleware = (req, res, next) => {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      throw new Error('Invalid token payload');
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token',
    });
  }
};
