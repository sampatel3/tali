import express from 'express';
import { uaePassLogin, uaePassCallback, logout, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/uae-pass/login', uaePassLogin);
router.post('/uae-pass/callback', uaePassCallback);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

export default router;
