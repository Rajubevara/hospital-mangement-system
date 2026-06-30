import express from 'express';
import {
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getPatients,
  getPatientDetails,
  getAdminStats,
  getAppointments,
  cancelAppointmentAdmin,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes require Admin authorization
router.use(protect);
router.use(authorizeRoles('Admin'));

// Stats
router.get('/stats', getAdminStats);

// Appointments
router.get('/appointments', getAppointments);
router.put('/appointments/:id/cancel', cancelAppointmentAdmin);

// Specialties
router.route('/specialties')
  .get(getSpecialties)
  .post(createSpecialty);

router.route('/specialties/:id')
  .put(updateSpecialty)
  .delete(deleteSpecialty);

// Doctors
router.route('/doctors')
  .get(getDoctors)
  .post(createDoctor);

router.route('/doctors/:id')
  .put(updateDoctor)
  .delete(deleteDoctor);

// Patients
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientDetails);

export default router;
