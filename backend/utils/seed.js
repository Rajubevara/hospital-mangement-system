import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Specialty from '../models/Specialty.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Message from '../models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing collections
    await User.deleteMany({});
    await Specialty.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Message.deleteMany({});
    console.log('Cleared all existing collections.');

    // 1. Create Specialties
    const specialties = await Specialty.insertMany([
      { name: 'Cardiology', description: 'Deals with disorders of the heart and the cardiovascular system.', icon: 'HeartIcon' },
      { name: 'Pediatrics', description: 'Medical care of infants, children, and adolescents.', icon: 'UserGroupIcon' },
      { name: 'Dermatology', description: 'Deals with skin, nails, hair and its diseases.', icon: 'SparklesIcon' },
      { name: 'Neurology', description: 'Deals with disorders of the nervous system.', icon: 'CpuChipIcon' },
      { name: 'Orthopedics', description: 'Deals with conditions involving the musculoskeletal system.', icon: 'WrenchIcon' },
    ]);
    console.log('Specialties Seeded.');

    const cardiologyId = specialties[0]._id;
    const pediatricsId = specialties[1]._id;

    // 2. Create Admin
    await User.create({
      name: 'HMS Admin',
      email: 'admin@hms.com',
      password: 'password123', // Will be hashed by userSchema.pre('save')
      role: 'Admin',
      phone: '1234567890',
    });
    console.log('Admin User Seeded.');

    // 3. Create Doctors
    const docUser1 = await User.create({
      name: 'Dr. John Doe',
      email: 'doctor@hms.com',
      password: 'password123',
      role: 'Doctor',
      phone: '9876543210',
    });

    const docUser2 = await User.create({
      name: 'Dr. Jane Smith',
      email: 'janesmith@hms.com',
      password: 'password123',
      role: 'Doctor',
      phone: '8765432109',
    });

    const doctor1 = await Doctor.create({
      user: docUser1._id,
      specialty: cardiologyId,
      experience: 12,
      qualification: 'MD, FACC Cardiology',
      biography: 'Dr. John Doe is a Senior Consultant Cardiologist with over 12 years of experience in interventional cardiology.',
      consultationFee: 150,
      availability: [
        { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
        { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
        { day: 'Friday', slots: ['09:00', '10:00', '11:00'] },
      ],
    });

    const doctor2 = await Doctor.create({
      user: docUser2._id,
      specialty: pediatricsId,
      experience: 8,
      qualification: 'MBBS, DCH Pediatrics',
      biography: 'Dr. Jane Smith is dedicated to child healthcare, offering preventive medicine and treatment for childhood ailments.',
      consultationFee: 100,
      availability: [
        { day: 'Tuesday', slots: ['10:00', '11:00', '12:00', '15:00', '16:00'] },
        { day: 'Thursday', slots: ['10:00', '11:00', '12:00', '15:00', '16:00'] },
      ],
    });
    console.log('Doctors Seeded.');

    // 4. Create Patients
    const patientUser1 = await User.create({
      name: 'Robert Miller',
      email: 'patient@hms.com',
      password: 'password123',
      role: 'Patient',
      phone: '7654321098',
    });

    const patient1 = await Patient.create({
      user: patientUser1._id,
      gender: 'Male',
      dateOfBirth: new Date('1988-05-15'),
      bloodGroup: 'O+',
      address: '456 Elm Street, Maplewood, NJ',
      medicalHistory: ['Hypertension', 'Lactose Intolerance'],
    });
    console.log('Patients Seeded.');

    // 5. Create a past completed appointment and a current pending appointment
    const appointmentPast = await Appointment.create({
      patient: patient1._id,
      doctor: doctor1._id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      slot: '10:00',
      status: 'Completed',
      reason: 'Regular heart checkup',
      paymentStatus: 'Paid',
    });

    const appointmentFuture = await Appointment.create({
      patient: patient1._id,
      doctor: doctor1._id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in the future
      slot: '11:00',
      status: 'Confirmed',
      reason: 'Follow-up ECG report discussion',
      paymentStatus: 'Pending',
    });

    // Create prescription for past appointment
    await Prescription.create({
      appointment: appointmentPast._id,
      patient: patient1._id,
      doctor: doctor1._id,
      diagnosis: 'Controlled Hypertension',
      medicines: [
        { name: 'Lisinopril', dosage: '1-0-0', duration: '30 days', instructions: 'Once daily after breakfast' },
        { name: 'Aspirin Low Dose', dosage: '0-1-0', duration: '30 days', instructions: 'Once daily with lunch' }
      ],
      labTests: ['Lipid Profile', 'ECG'],
      advice: 'Maintain a low-sodium diet and jog for 30 minutes daily.',
      pdfPath: 'uploads/prescription-seeding-mock.pdf',
    });
    console.log('Appointments & Prescriptions Seeded.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with Seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
