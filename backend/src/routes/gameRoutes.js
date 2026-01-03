import express from 'express';
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} from '../controllers/gameController.js';
import { authRequired, adminOrSuperAdminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getGames);
router.get('/:id', getGame);
router.post('/', authRequired, adminOrSuperAdminOnly, createGame);
router.put('/:id', authRequired, adminOrSuperAdminOnly, updateGame);
router.delete('/:id', authRequired, adminOrSuperAdminOnly, deleteGame);

export default router;
