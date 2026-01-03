import { getHomeVisitStats } from '../models/logModel.js';
import { logAction } from '../utils/logger.js';

const DEFAULT_START = '2025-11-01';
const DEFAULT_END = '2026-12-31';

const buildMonthRange = (start, end) => {
  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);
  const months = [];

  const cursor = new Date(startDate);
  cursor.setUTCDate(1);

  while (cursor <= endDate) {
    const year = cursor.getUTCFullYear();
    const month = `${cursor.getUTCMonth() + 1}`.padStart(2, '0');
    months.push(`${year}-${month}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
};

export const recordHomeVisit = async (req, res) => {
  try {
    await logAction(req, { action: 'HOME_VISIT', entityType: 'PAGE', meta: { path: '/Home' } });
    return res.json({ message: 'Visit recorded' });
  } catch (error) {
    console.error('recordHomeVisit error', error);
    return res.status(500).json({ message: 'Gagal mencatat kunjungan.' });
  }
};

export const homeVisitSummary = async (req, res) => {
  try {
    const start = req.query.start || DEFAULT_START;
    const end = req.query.end || DEFAULT_END;

    const raw = await getHomeVisitStats(start, end);
    const monthRange = buildMonthRange(start, end);
    const mapped = monthRange.map((month) => {
      const found = raw.find((row) => row.month === month);
      return {
        month,
        count: Number(found?.count || 0),
      };
    });

    return res.json(mapped);
  } catch (error) {
    console.error('homeVisitSummary error', error);
    return res.status(500).json({ message: 'Gagal mengambil ringkasan kunjungan.' });
  }
};
