import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken, sendError } from '../utils';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'Access denied. No token provided.');
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      sendError(res, 401, 'Token expired. Please login again.');
      return;
    }
    if (error instanceof JsonWebTokenError) {
      sendError(res, 401, 'Invalid token.');
      return;
    }
    sendError(res, 500, 'Authentication error.');
  }
};
