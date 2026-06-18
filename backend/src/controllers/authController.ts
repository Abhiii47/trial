import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper to sign JWT
const getSignedJwtToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey123!@#', {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as any,
  });
};

// @desc    Auth user & get token
// @route   POST /auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    let user = await User.findOne({ email }).select('+password');
    let isMatch = false;

    if (user) {
      isMatch = await user.matchPassword(password);
    }

    if (!user || !isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Create token
    const token = getSignedJwtToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error during login',
      error: error instanceof Error ? error.message : error,
    });
  }
};
