import express from 'express';
import { getChatHistory } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/history/:partnerId', protect, getChatHistory);

export default router;
