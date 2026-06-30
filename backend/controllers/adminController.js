import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Specialty from '../models/Specialty.js';
import Appointment from '../models/Appointment.js';

// ==========================================
// SPECIALTY CRUD
// ==========================================

export const getSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find({});
    res.json({ success: true, specialties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSpecialty = async (req, res) => {
  const { name, description, icon } = req.body;
  try {
    const exists = await Specialty.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Specialty already exists' });
    }
    const specialty = await Specialty.create({ name, description, icon });
    res.status(201).json({ success: true, specialty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSpecialty = async (req, res) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;
  try {
    const specialty = await Specialty.findByIdAndUpdate(
      id,
      { name, description, icon },
      { new: true }
    );
    if (!specialty) {
      return res.status(404).json({ success: false, message: 'Specialty not found' });
    }
    res.json({ success: true, specialty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSpecialty = async (req, res) => {
  const { id } = req.params;
  try {
    const specialty = await Specialty.findById(id);
    if (!specialty) {
      return res.status(404).json({ success: false, message: 'Specialty not found' });
    }
    // Check if any doctor is using this specialty
    const doctorCount = await Doctor.countDocuments({ specialty: id });
    if (doctorCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete specialty: It is currently assigned to doctors.',
      });
    }
    await specialty.deleteOne();
    res.json({ success: true, message: 'Specialty deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// DOCTOR CRUD
// ==========================================

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({})
      .populate('user', '-password')
      .populate('specialty');
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDoctor = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    specialty,
    experience,
    qualification,
    biography,
    consultationFee,
    availability,
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check specialty validity
    const spec = await Specialty.findById(specialty);
    if (!spec) {
      return res.status(400).json({ success: false, message: 'Invalid specialty ID' });
    }

    // Create doctor User
    const user = await User.create({
      name,
      email,
      password,
      role: 'Doctor',
      phone,
    });

    // Create doctor Profile
    const doctor = await Doctor.create({
      user: user._id,
      specialty,
      experience,
      qualification,
      biography,
      consultationFee,
      availability: availability || [],
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', '-password')
      .populate('specialty');

    res.status(201).json({ success: true, doctor: populatedDoctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    specialty,
    experience,
    qualification,
    biography,
    consultationFee,
    availability,
    isActive,
  } = req.body;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Update associated User details
    const user = await User.findById(doctor.user);
    if (user) {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (isActive !== undefined) user.isActive = isActive;
      await user.save();
    }

    // Update Doctor profile details
    if (specialty !== undefined) {
      const spec = await Specialty.findById(specialty);
      if (!spec) return res.status(400).json({ success: false, message: 'Invalid specialty ID' });
      doctor.specialty = specialty;
    }
    if (experience !== undefined) doctor.experience = experience;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (biography !== undefined) doctor.biography = biography;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availability !== undefined) doctor.availability = availability;

    await doctor.save();

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', '-password')
      .populate('specialty');

    res.json({ success: true, doctor: populatedDoctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Delete user record
    await User.findByIdAndDelete(doctor.user);
    // Delete doctor record
    await doctor.deleteOne();

    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// PATIENT VIEWING
// ==========================================

export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).populate('user', '-password');
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await Patient.findById(id).populate('user', '-password');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    const appointments = await Appointment.find({ patient: id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });

    res.json({ success: true, patient, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// DASHBOARD STATS
// ==========================================

export const getAdminStats = async (req, res) => {
  try {
    const doctorCount = await Doctor.countDocuments({});
    const patientCount = await Patient.countDocuments({});
    const totalAppointments = await Appointment.countDocuments({});

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday },
    });

    // Appointment breakdown by status
    const statusData = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Specialty breakdown
    const specialtyData = await Doctor.aggregate([
      { $group: { _id: '$specialty', doctorCount: { $sum: 1 } } },
      { $lookup: { from: 'specialties', localField: '_id', foreignField: '_id', as: 'specialty' } },
      { $unwind: '$specialty' },
      { $project: { name: '$specialty.name', count: '$doctorCount' } },
    ]);

    res.json({
      success: true,
      stats: {
        doctors: doctorCount,
        patients: patientCount,
        appointments: totalAppointments,
        todayAppointments,
        statusBreakdown: statusData.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 }),
        specialtyBreakdown: specialtyData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelAppointmentAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    appointment.status = 'Cancelled';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
