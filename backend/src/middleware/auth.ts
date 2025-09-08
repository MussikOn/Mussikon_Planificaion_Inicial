import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AppError, createError } from '../utils/errorHandler';
import { JWTPayload } from '../types';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    console.log('Backend: Token received:', token);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      console.log('Backend: Token decoded successfully:', decoded);
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('Backend: Current time (Unix timestamp):', currentTime);
    if (decoded.exp) {
      console.log('Backend: Token expiration (Unix timestamp):', decoded.exp);
      if (decoded.exp < currentTime) {
        console.log('Backend: Token is EXPIRED on backend.');
      } else {
        console.log('Backend: Token is NOT EXPIRED on backend.');
      }
    } else {
      console.log('Backend: Token does NOT have an expiration claim (exp).');
    }
      (req as any).user = decoded;
      next();
    } catch (jwtError) {
      throw createError('Invalid or expired token', 401);
    }
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
};

