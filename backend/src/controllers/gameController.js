import {
  getAllGames,
  getGameById,
  createGame as createGameModel,
  updateGame as updateGameModel,
  deleteGame as deleteGameModel,
} from '../models/gameModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isSuperAdmin } from '../middleware/authMiddleware.js';
import { logAction } from '../utils/logger.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';

export const getGames = async (req, res) => {
  try {
    let requester = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [, token] = authHeader.split(' ');
      if (token) {
        try {
          requester = jwt.verify(token, jwtSecret);
        } catch (err) {
          requester = null;
        }
      }
    }

    let games = await getAllGames();

    if (requester && requester.role === 'ADMIN') {
      games = games.filter((game) => String(game.owner_id) === String(requester.id));
    }

    return res.json(games);
  } catch (error) {
    console.error('getGames error', error);
    return res.status(500).json({ message: 'Gagal mengambil data game.' });
  }
};

export const getGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await getGameById(id);

    if (!game) {
      return res.status(404).json({ message: 'Game tidak ditemukan.' });
    }

    return res.json(game);
  } catch (error) {
    console.error('getGame error', error);
    return res.status(500).json({ message: 'Gagal mengambil detail game.' });
  }
};

export const createGame = async (req, res) => {
  try {
    const requiredFields = ['title', 'description', 'cover_image'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Field ${field} wajib diisi.` });
      }
    }

    const newGame = await createGameModel({
      ...req.body,
      owner_id: req.user?.id || null,
    });

    await logAction(req, {
      action: 'GAME_CREATED',
      entityType: 'GAME',
      entityId: newGame.id,
      meta: { title: newGame.title },
    });
    return res.status(201).json(newGame);
  } catch (error) {
    console.error('createGame error', error);
    return res.status(500).json({ message: 'Gagal menambahkan game.' });
  }
};

export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getGameById(id);

    if (!existing) {
      return res.status(404).json({ message: 'Game tidak ditemukan.' });
    }

    if (!isSuperAdmin(req.user) && String(existing.owner_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Tidak diizinkan mengubah game ini.' });
    }

    const payload = {
      ...existing,
      ...req.body,
      owner_id: existing.owner_id,
    };

    await updateGameModel(id, payload);
    const updated = await getGameById(id);

    await logAction(req, {
      action: 'GAME_UPDATED',
      entityType: 'GAME',
      entityId: id,
      meta: { title: updated?.title },
    });
    return res.json(updated);
  } catch (error) {
    console.error('updateGame error', error);
    return res.status(500).json({ message: 'Gagal memperbarui game.' });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getGameById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Game tidak ditemukan.' });
    }

    if (!isSuperAdmin(req.user) && String(existing.owner_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Tidak diizinkan menghapus game ini.' });
    }

    await deleteGameModel(id);

    await logAction(req, {
      action: 'GAME_DELETED',
      entityType: 'GAME',
      entityId: id,
      meta: { title: existing?.title },
    });
    return res.json({ message: 'Game berhasil dihapus.' });
  } catch (error) {
    console.error('deleteGame error', error);
    return res.status(500).json({ message: 'Gagal menghapus game.' });
  }
};
