import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import { generatePrescriptionPDF } from '../services/pdfService.js';

// Get doctor profile details & availability
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', '-password')
      .populate('specialty');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor profile (biography, qualification, availability slots)
export const updateDoctorProfile = async (req, res) => {
  const { biography, qualification, consultationFee, availability } = req.body;
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (biography !== undefined) doctor.biography = biography;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availability !== undefined) doctor.availability = availability;

    await doctor.save();
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
      .sort({ date: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Confirmed', 'Cancelled', 'Completed'

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Write a prescription and generate PDF
export const writePrescription = async (req, res) => {
  const { id } = req.params; // appointment id
  const { diagnosis, medicines, labTests, advice } = req.body;

  try {
    const appointment = await Appointment.findById(id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Create prescription in DB
    const prescription = new Prescription({
      appointment: appointment._id,
      patient: appointment.patient._id,
      doctor: appointment.doctor._id,
      diagnosis,
      medicines: medicines || [],
      labTests: labTests || [],
      advice: advice || '',
    });

    // Generate prescription PDF using helper
    const pdfFilename = `prescription-${prescription._id}.pdf`;
    const pdfPath = `uploads/${pdfFilename}`;

    await generatePrescriptionPDF(
      {
        doctorName: appointment.doctor.user.name,
        patientName: appointment.patient.user.name,
        date: new Date(),
        diagnosis,
        medicines,
        labTests,
        advice,
      },
      pdfPath
    );

    prescription.pdfPath = pdfPath;
    await prescription.save();

    // Mark appointment as Completed
    appointment.status = 'Completed';
    await appointment.save();

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Doctor Portal Stats
export const getDoctorStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id });

    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === 'Pending').length;
    const confirmed = appointments.filter((a) => a.status === 'Confirmed').length;
    const completed = appointments.filter((a) => a.status === 'Completed').length;

    // Get unique patients
    const patientIds = [...new Set(appointments.map((a) => a.patient.toString()))];

    res.json({
      success: true,
      stats: {
        totalAppointments: total,
        pendingAppointments: pending,
        confirmedAppointments: confirmed,
        completedAppointments: completed,
        totalPatients: patientIds.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
