import { getReviewsByGameId, createReview, deleteReview, getReviewById } from '../models/reviewModel.js';
import { getGameById } from '../models/gameModel.js';
import { isSuperAdmin } from '../middleware/authMiddleware.js';
import { logAction } from '../utils/logger.js';

export const getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await getReviewsByGameId(id);
    return res.json(reviews);
  } catch (error) {
    console.error('getReviews error', error);
    return res.status(500).json({ message: 'Gagal mengambil review.' });
  }
};

export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const parsedRating = parseInt(rating, 10);
    if (!parsedRating || parsedRating < 1 || parsedRating > 10) {
      return res.status(400).json({ message: 'Rating harus antara 1 hingga 10.' });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({ message: 'Komentar terlalu pendek.' });
    }

    const game = await getGameById(id);
    if (!game) {
      return res.status(404).json({ message: 'Game tidak ditemukan.' });
    }

    const review = await createReview({
      game_id: id,
      user_id: req.user.id,
      rating: parsedRating,
      comment: comment.trim(),
    });

    await logAction(req, {
      action: 'REVIEW_CREATED',
      entityType: 'REVIEW',
      entityId: review.id,
      meta: { gameId: id, rating: parsedRating },
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('addReview error', error);
    return res.status(500).json({ message: 'Gagal menambahkan review.' });
  }
};

export const removeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan.' });
    }

    const game = await getGameById(review.game_id);

    const isOwnerAdmin =
      req.user?.role === 'ADMIN' && game && String(game.owner_id) === String(req.user.id);

    const isReviewAuthor = String(review.user_id) === String(req.user.id);

    if (!(isSuperAdmin(req.user) || isOwnerAdmin || isReviewAuthor)) {
      return res.status(403).json({ message: 'Tidak diizinkan menghapus review ini.' });
    }

    await deleteReview(reviewId);

    await logAction(req, {
      action: 'REVIEW_DELETED',
      entityType: 'REVIEW',
      entityId: reviewId,
      meta: { gameId: review.game_id },
    });
    return res.json({ message: 'Review dihapus.' });
  } catch (error) {
    console.error('removeReview error', error);
    return res.status(500).json({ message: 'Gagal menghapus review.' });
  }
};
