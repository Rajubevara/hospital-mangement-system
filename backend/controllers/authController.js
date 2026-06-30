import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { sendEmail } from '../services/emailService.js';

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforhospitalmanagement123!', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }

      // Check if user is a doctor or patient to attach sub-profile ID
      let doctorId = null;
      let patientId = null;

      if (user.role === 'Doctor') {
        const doc = await Doctor.findOne({ user: user._id });
        if (doc) doctorId = doc._id;
      } else if (user.role === 'Patient') {
        const pat = await Patient.findOne({ user: user._id });
        if (pat) patientId = pat._id;
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          doctorId,
          patientId,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
export const registerPatient = async (req, res) => {
  const { name, email, password, phone, gender, dateOfBirth, bloodGroup, address } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role: 'Patient',
      phone,
    });

    // Create Patient profile
    const patient = await Patient.create({
      user: user._id,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      bloodGroup,
      address,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        patientId: patient._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let docOrPatInfo = {};
      if (user.role === 'Doctor') {
        const doc = await Doctor.findOne({ user: user._id }).populate('specialty');
        docOrPatInfo = { doctor: doc };
      } else if (user.role === 'Patient') {
        const pat = await Patient.findOne({ user: user._id });
        docOrPatInfo = { patient: pat };
      }

      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          ...docOrPatInfo,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password - request reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user registered with that email' });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    // Dynamically resolve origin for multi-tenant portal domains
    const origin = req.headers.origin || (user.role === 'Doctor' ? 'http://localhost:3001' : 'http://localhost:3002');
    const resetUrl = `${origin}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a POST request to:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0f172a; color: #f1f5f9;">
        <h2 style="color: #38bdf8; text-align: center;">MEDICLINK HMS</h2>
        <h3 style="color: #f1f5f9; text-align: center;">Password Reset Request</h3>
        <p>Dear ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #38bdf8;">${resetUrl}</p>
        <p style="font-size: 11px; color: #64748b; margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px;">
          If you did not request this password reset, please ignore this email. This link will expire in 1 hour.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Mediclink HMS - Password Reset Request',
      text: message,
      html,
    });

    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    try {
      const user = await User.findOne({ email });
      if (user) {
        user.resetPasswordToken = '';
        user.resetPasswordExpire = undefined;
        await user.save();
      }
    } catch (e) {}

    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = '';
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
