import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';
import { generateAccessToken, generateRefreshToken, sendSuccess, sendError } from '../utils';
import { RegisterInput, LoginInput } from '../validators';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as RegisterInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 409, 'Email already registered');
      return;
    }

    const user = await User.create({ name, email, password });

    const payload = { id: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    sendSuccess(res, 201, 'Registration successful', {
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    sendError(res, 500, 'Registration failed', error);
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    // findByEmail is a static method that includes the password field
    const user = await (User as unknown as {
      findByEmail: (email: string) => Promise<(typeof User.prototype & { comparePassword: (p: string) => Promise<boolean> }) | null>
    }).findByEmail(email);

    if (!user) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    const payload = { id: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    sendSuccess(res, 200, 'Login successful', {
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    sendError(res, 500, 'Login failed', error);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }
    sendSuccess(res, 200, 'User fetched', {
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch user', error);
  }
};
