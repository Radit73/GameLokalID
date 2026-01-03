import { supabase } from '../config/supabase.js';

export const getReviewsByGameId = async (gameId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, game_id, user_id, rating, comment, created_at, users(name)')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    ...row,
    user_name: row.users?.name || null,
    users: undefined,
  }));
};

export const createReview = async ({ game_id, user_id, rating, comment }) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ game_id, user_id, rating, comment }])
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id, game_id, user_id, rating, comment };
};

export const deleteReview = async (id) => {
  const { data, error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) throw error;
  return { changes: data?.length || 0 };
};

export const getReviewById = async (id) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};
