import express from 'express';
import { getReviews, addReview, removeReview } from '../controllers/reviewController.js';
import { authRequired } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/games/:id/reviews', getReviews);
router.post('/games/:id/reviews', authRequired, addReview);
router.delete('/reviews/:reviewId', authRequired, removeReview);

export default router;
