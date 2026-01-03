import express from 'express';
import { getRandomEmoji } from '../controllers/emojiController.js';

const router = express.Router();

router.get('/mini/emoji', getRandomEmoji);

export default router;
