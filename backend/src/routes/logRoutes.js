import express from 'express';
import { listLogs } from '../controllers/logController.js';
import { authRequired } from '../middleware/authMiddleware.js';

const router = express.Router();

const superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Hanya super admin yang dapat melihat log.' });
  }
  return next();
};

router.get('/logs', authRequired, superAdminOnly, listLogs);

export default router;
