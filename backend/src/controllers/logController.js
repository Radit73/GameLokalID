import { getLogs } from '../models/logModel.js';

export const listLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const logs = await getLogs(limit);
    return res.json(logs);
  } catch (error) {
    console.error('listLogs error', error);
    return res.status(500).json({ message: 'Gagal mengambil log.' });
  }
};
