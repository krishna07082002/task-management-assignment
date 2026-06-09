import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload, ApiResponse } from '../types';
import { Response } from 'express';
import { ZodError } from 'zod';

// ─── JWT Helpers ────────────────────────────────────────────────────────────

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

// ─── Response Helpers ────────────────────────────────────────────────────────

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
): Response<ApiResponse> => {
  return res.status(statusCode).json({ success: false, message, errors });
};

// ─── Format Zod Errors ───────────────────────────────────────────────────────

export const formatZodErrors = (
  error: ZodError,
): Record<string, string> => {
  return error.errors.reduce(
    (acc, curr) => {
      const key = curr.path.join('.');
      acc[key] = curr.message;
      return acc;
    },
    {} as Record<string, string>,
  );
};
