import express from 'express';
import { createChatCompletion } from '../controllers/chatController.js';

const router = express.Router();

router.post('/chat', createChatCompletion);

export default router;
