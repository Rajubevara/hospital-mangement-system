import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Specialty from '../models/Specialty.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

// Get patient profile
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', '-password');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
  const { phone, dateOfBirth, gender, bloodGroup, address, medicalHistory } = req.body;
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Update User phone
    const user = await User.findById(req.user._id);
    if (user && phone !== undefined) {
      user.phone = phone;
      await user.save();
    }

    if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) patient.gender = gender;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (address !== undefined) patient.address = address;
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;

    await patient.save();

    const populatedPatient = await Patient.findById(patient._id).populate('user', '-password');
    res.json({ success: true, patient: populatedPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search doctors with filters (specialty, search query on name)
export const searchDoctors = async (req, res) => {
  const { specialtyId, search } = req.query;

  try {
    const query = {};

    if (specialtyId) {
      query.specialty = specialtyId;
    }

    let doctors = await Doctor.find(query)
      .populate('user', 'name email phone avatar isActive')
      .populate('specialty');

    // Filter by name and active status
    doctors = doctors.filter((doc) => doc.user && doc.user.isActive);

    if (search) {
      const regex = new RegExp(search, 'i');
      doctors = doctors.filter((doc) => regex.test(doc.user.name));
    }

    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available slots for a doctor on a specific date
export const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query; // YYYY-MM-DD

  if (!doctorId || !date) {
    return res.status(400).json({ success: false, message: 'Please provide doctorId and date' });
  }

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Determine the day of the week
    const targetDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[targetDate.getDay()];

    // Find doctor's availability for that day
    const daySchedule = doctor.availability.find((a) => a.day === dayOfWeek);

    if (!daySchedule) {
      return res.json({ success: true, slots: [] }); // Doctor is not available on this day
    }

    // Get all existing appointments for this doctor on this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Pending', 'Confirmed'] },
    });

    const bookedSlots = bookedAppointments.map((app) => app.slot);

    // Filter out booked slots
    const availableSlots = daySchedule.slots.filter((slot) => !bookedSlots.includes(slot));

    res.json({ success: true, slots: availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Book Appointment
export const bookAppointment = async (req, res) => {
  const { doctorId, date, slot, reason } = req.body;

  if (!doctorId || !date || !slot) {
    return res.status(400).json({ success: false, message: 'Please provide doctorId, date and slot' });
  }

  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Verify slot isn't already booked
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const slotBooked = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      slot,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (slotBooked) {
      return res.status(400).json({ success: false, message: 'This slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      date: new Date(date),
      slot,
      reason,
      status: 'Pending',
    });

    // Populate user info for emails
    const patientPopulated = await Patient.findById(patient._id).populate('user');
    const doctorPopulated = await Doctor.findById(doctorId).populate('user');

    const formattedDate = new Date(date).toLocaleDateString();

    // 1. Notify Doctor
    if (doctorPopulated?.user?.email) {
      const loginUrl = process.env.DOCTOR_PORTAL_URL || 'http://localhost:3001';
      const doctorSubject = `New Appointment Request - ${patientPopulated.user.name}`;
      const doctorMessage = `Hello Dr. ${doctorPopulated.user.name},\n\nYou have received a new outpatient visit request from ${patientPopulated.user.name}.\nDate: ${formattedDate}\nSlot: ${slot}\nReason: ${reason || 'Routine Checkup'}\n\nPlease log into the clinical dashboard to confirm or manage this appointment:\n${loginUrl}`;
      const doctorHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0f172a; color: #f1f5f9;">
          <h2 style="color: #0d9488; text-align: center;">MEDICLINK HMS</h2>
          <h3 style="color: #f1f5f9; text-align: center;">New Appointment Request</h3>
          <p>Dear Dr. ${doctorPopulated.user.name},</p>
          <p>You have a new appointment booking request awaiting your review.</p>
          
          <div style="background-color: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientPopulated.user.name}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${slot}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason || 'Routine Checkup'}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Open Doctor Portal</a>
          </div>
          
          <p style="font-size: 11px; color: #64748b; margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px;">
            This is an automated notification. Please do not reply directly to this email.
          </p>
        </div>
      `;

      sendEmail({
        to: doctorPopulated.user.email,
        subject: doctorSubject,
        text: doctorMessage,
        html: doctorHtml
      }).catch(err => console.error(`Error sending email to doctor: ${err.message}`));
    }

    // 2. Notify Patient
    if (patientPopulated?.user?.email) {
      const patientSubject = `Appointment Booking Submitted - Dr. ${doctorPopulated.user.name}`;
      const patientMessage = `Hello ${patientPopulated.user.name},\n\nYour appointment booking request with Dr. ${doctorPopulated.user.name} has been successfully submitted.\nDate: ${formattedDate}\nSlot: ${slot}\nStatus: Pending Approval\n\nWe will notify you once the doctor confirms your visit.`;
      const patientHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0f172a; color: #f1f5f9;">
          <h2 style="color: #3b82f6; text-align: center;">MEDICLINK HMS</h2>
          <h3 style="color: #f1f5f9; text-align: center;">Booking Request Received</h3>
          <p>Dear ${patientPopulated.user.name},</p>
          <p>Your appointment request has been successfully submitted and is currently <strong>Pending Approval</strong> from the doctor.</p>
          
          <div style="background-color: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorPopulated.user.name}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${slot}</p>
          </div>
          
          <p>We will send you another email as soon as the doctor confirms or updates your scheduled visit.</p>
          
          <p style="font-size: 11px; color: #64748b; margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px;">
            This is an automated notification. Please do not reply directly to this email.
          </p>
        </div>
      `;

      sendEmail({
        to: patientPopulated.user.email,
        subject: patientSubject,
        text: patientMessage,
        html: patientHtml
      }).catch(err => console.error(`Error sending email to patient: ${err.message}`));
    }

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar phone' } })
      .populate({ path: 'doctor', populate: { path: 'specialty', select: 'name' } })
      .sort({ date: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient's prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'doctor', populate: { path: 'specialty', select: 'name' } })
      .sort({ date: -1 });

    res.json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Appointment
export const cancelAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Make sure patient is owner of appointment
    if (appointment.patient.toString() !== patient._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
