import { supabase } from '../config/supabase.js';

export const createUser = async (name, email, password, role = 'USER') => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password, role }])
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id, name, email, role };
};

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};
