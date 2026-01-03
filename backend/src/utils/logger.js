import { createLog } from '../models/logModel.js';

export const logAction = async (req, { action, entityType = null, entityId = null, meta = null }) => {
  try {
    const user = req?.user;
    await createLog({
      userId: user?.id || null,
      role: user?.role || null,
      action,
      entityType,
      entityId,
      meta,
      ip: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (error) {
    // Logging is best-effort; swallow errors to not block main flow
    console.error('logAction error', error);
  }
};
