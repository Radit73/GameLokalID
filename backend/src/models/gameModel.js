import { supabase } from '../config/supabase.js';

const withStats = (games, reviews) => {
  const stats = new Map();
  reviews.forEach((review) => {
    const entry = stats.get(review.game_id) || { total: 0, count: 0 };
    entry.total += Number(review.rating || 0);
    entry.count += 1;
    stats.set(review.game_id, entry);
  });

  return games.map((game) => {
    const entry = stats.get(game.id) || { total: 0, count: 0 };
    const avg = entry.count ? entry.total / entry.count : 0;
    return {
      ...game,
      avg_rating: Number(avg.toFixed(2)),
      review_count: entry.count,
    };
  });
};

export const getAllGames = async () => {
  const { data: games, error: gameError } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });

  if (gameError) throw gameError;

  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('game_id,rating');

  if (reviewError) throw reviewError;

  return withStats(games || [], reviews || []);
};

export const getGameById = async (id) => {
  const { data: games, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .limit(1);

  if (gameError) throw gameError;
  const game = games?.[0];
  if (!game) return null;

  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('game_id', id);

  if (reviewError) throw reviewError;

  const total = (reviews || []).reduce((sum, item) => sum + Number(item.rating || 0), 0);
  const count = reviews?.length || 0;
  const avg = count ? total / count : 0;

  return {
    ...game,
    avg_rating: Number(avg.toFixed(2)),
    review_count: count,
  };
};

export const createGame = async (game) => {
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id, ...game };
};

export const updateGame = async (id, game) => {
  const { data, error } = await supabase
    .from('games')
    .update(game)
    .eq('id', id)
    .select('id');

  if (error) throw error;
  return { changes: data?.length || 0 };
};

export const deleteGame = async (id) => {
  const { data, error } = await supabase
    .from('games')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) throw error;
  return { changes: data?.length || 0 };
};
