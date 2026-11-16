const Users = require('../models/users');
const Sessions = require('../models/sessions');
const { getDB } = require('../config/db');
const { hashPassword, verifyPassword, generateSecureToken, hashToken } = require('../utils/cryptoUtils');

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email and password are required.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match.'
        });
      }

      const existing = await Users.findByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const passwordHash = await hashPassword(password);
      const user = await Users.create({
        name,
        email,
        passwordHash,
        role: 'user'
      });

      // Generate session token
      const token = generateSecureToken(32);
      await Sessions.create(user._id, user.role, token);

      // Set HTTP-only cookie
      res.cookie('pt_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const user = await Users.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Generate session token
      const token = generateSecureToken(32);
      await Sessions.create(user._id, user.role, token);

      // Set HTTP-only cookie
      res.cookie('pt_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      if (req.sessionToken) {
        await Sessions.deleteByToken(req.sessionToken);
      }
      res.clearCookie('pt_session');
      return res.json({
        success: true,
        message: 'Successfully logged out.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      return res.json({
        success: true,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty.'
        });
      }

      const updated = await Users.update(req.user._id, { name: name.trim() });
      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          role: updated.role
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required.'
        });
      }

      const user = await Users.findByEmail(email);
      // For security, do not leak whether email exists
      if (!user) {
        return res.json({
          success: true,
          message: 'If that email exists in our records, a password reset token has been generated.'
        });
      }

      const resetToken = generateSecureToken(24);
      const tokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await getDB().collection('passwordResets').updateOne(
        { email: user.email },
        {
          $set: {
            email: user.email,
            tokenHash,
            expiresAt,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      console.log(`[Password Reset Simulation] Reset token for ${email}: ${resetToken}`);

      return res.json({
        success: true,
        message: 'If that email exists in our records, a password reset token has been generated.',
        demoResetToken: resetToken // Helpful for local testing/demo
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, reset token and new password are required.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      const tokenHash = hashToken(token);
      const resetRecord = await getDB().collection('passwordResets').findOne({
        email: email.toLowerCase().trim(),
        tokenHash,
        expiresAt: { $gt: new Date() }
      });

      if (!resetRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token.'
        });
      }

      const user = await Users.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.'
        });
      }

      const newHash = await hashPassword(newPassword);
      await Users.updatePassword(user._id, newHash);

      // Invalidate the reset token
      await getDB().collection('passwordResets').deleteOne({ _id: resetRecord._id });

      // Invalidate existing sessions for security
      await Sessions.deleteByUserId(user._id);

      return res.json({
        success: true,
        message: 'Password reset successful. You may now log in with your new password.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
