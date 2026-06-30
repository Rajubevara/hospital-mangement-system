import express from 'express';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  writePrescription,
  getDoctorStats,
} from '../controllers/doctorController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes require Doctor authorization
router.use(protect);
router.use(authorizeRoles('Doctor'));

router.get('/stats', getDoctorStats);

router.route('/profile')
  .get(getDoctorProfile)
  .put(updateDoctorProfile);

router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.post('/appointments/:id/prescription', writePrescription);

export default router;
