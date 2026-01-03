import express from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import { homeVisitSummary, recordHomeVisit } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/analytics/home-visit', authRequired, recordHomeVisit);
router.get('/analytics/home-visits', homeVisitSummary);

export default router;
