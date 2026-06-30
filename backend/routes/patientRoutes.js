import express from 'express';
import {
  getPatientProfile,
  updatePatientProfile,
  searchDoctors,
  getAvailableSlots,
  bookAppointment,
  getPatientAppointments,
  getPatientPrescriptions,
  cancelAppointment,
} from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes require Patient authorization
router.use(protect);
router.use(authorizeRoles('Patient'));

router.route('/profile')
  .get(getPatientProfile)
  .put(updatePatientProfile);

router.get('/doctors', searchDoctors);
router.get('/slots', getAvailableSlots);

router.route('/appointments')
  .post(bookAppointment)
  .get(getPatientAppointments);

router.put('/appointments/:id/cancel', cancelAppointment);

router.get('/prescriptions', getPatientPrescriptions);

export default router;
