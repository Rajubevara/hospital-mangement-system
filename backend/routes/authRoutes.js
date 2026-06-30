import express from 'express';
import { loginUser, registerPatient, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerPatient);
router.get('/me', protect, getUserProfile);

export default router;
