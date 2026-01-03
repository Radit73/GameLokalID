import express from 'express';
import { login, register, registerAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/register/admin', registerAdmin);
router.post('/login', login);

export default router;
