import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

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
