import { supabase } from '../config/supabase.js';

export const createLog = async ({
  userId = null,
  role = null,
  action,
  entityType = null,
  entityId = null,
  meta = null,
  ip = null,
  userAgent = null,
}) => {
  const { data, error } = await supabase
    .from('user_logs')
    .insert([
      {
        user_id: userId,
        role,
        action,
        entity_type: entityType,
        entity_id: entityId,
        meta,
        ip,
        user_agent: userAgent,
      },
    ])
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id };
};

export const getLogs = async (limit = 200) => {
  const { data, error } = await supabase
    .from('user_logs')
    .select('id, user_id, role, action, entity_type, entity_id, meta, ip, user_agent, created_at, users(name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row) => ({
    ...row,
    user_name: row.users?.name || null,
    user_email: row.users?.email || null,
    users: undefined,
  }));
};

export const getHomeVisitStats = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from('user_logs')
    .select('created_at')
    .eq('action', 'LOGIN_SUCCESS')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) throw error;

  const counts = new Map();
  (data || []).forEach((row) => {
    const date = new Date(row.created_at);
    const month = `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(2, '0')}`;
    counts.set(month, (counts.get(month) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
};
