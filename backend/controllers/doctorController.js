import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import { generatePrescriptionPDF } from '../services/pdfService.js';
import { sendEmail } from '../services/emailService.js';

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
    const appointment = await Appointment.findById(id)
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    // Notify Patient via Email
    const patientEmail = appointment.patient?.user?.email;
    if (patientEmail) {
      const formattedDate = new Date(appointment.date).toLocaleDateString();
      const patientName = appointment.patient.user.name;
      const doctorName = appointment.doctor.user.name;

      let statusColor = '#3b82f6';
      let statusText = status;
      if (status === 'Confirmed') {
        statusColor = '#10b981';
      } else if (status === 'Cancelled') {
        statusColor = '#ef4444';
      } else if (status === 'Completed') {
        statusColor = '#06b6d4';
      }

      const patientSubject = `Appointment Status Update: ${status} - Dr. ${doctorName}`;
      const patientMessage = `Hello ${patientName},\n\nYour appointment with Dr. ${doctorName} on ${formattedDate} (Slot: ${appointment.slot}) has been updated to: ${status}.\n\nThank you for choosing Mediclink.`;
      
      const patientHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0f172a; color: #f1f5f9;">
          <h2 style="color: #3b82f6; text-align: center;">MEDICLINK HMS</h2>
          <h3 style="color: #f1f5f9; text-align: center;">Appointment Status Update</h3>
          <p>Dear ${patientName},</p>
          <p>The status of your appointment booking with <strong>Dr. ${doctorName}</strong> has been updated.</p>
          
          <div style="background-color: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <span style="font-size: 16px; font-weight: bold; color: ${statusColor}; text-transform: uppercase;">
              Status: ${statusText}
            </span>
          </div>

          <div style="background-color: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${appointment.slot}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointment.reason || 'Routine Checkup'}</p>
          </div>
          
          <p style="font-size: 11px; color: #64748b; margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px;">
            This is an automated notification. Please do not reply directly to this email.
          </p>
        </div>
      `;

      sendEmail({
        to: patientEmail,
        subject: patientSubject,
        text: patientMessage,
        html: patientHtml
      }).catch(err => console.error(`Error sending status update email: ${err.message}`));
    }

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
    const pdfFilename = `prescription-${appointment._id}.pdf`;
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
