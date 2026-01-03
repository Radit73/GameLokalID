const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const { headers, ...rest } = options;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    ...rest,
  };

  const response = await fetch(`${API_URL}${path}`, config);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server.');
  }
  return data;
};

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = ({ name, email, password, role = 'USER', profilePhoto }) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role, profilePhoto }),
  });

export const registerAdmin = (name, email, password, passcode) =>
  request('/auth/register/admin', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, passcode }),
  });

export const recordHomeVisit = (token) =>
  request('/analytics/home-visit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getHomeVisitSummary = (token, start = '2025-11-01', end = '2026-12-31') => {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
  return request(`/analytics/home-visits?start=${start}&end=${end}`, { headers });
};

export const subscribeNewsletter = (email) =>
  request('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const getRandomEmoji = () => request('/mini/emoji');

export const getGames = (token) =>
  request('/games', {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

export const getGameById = (id) => request(`/games/${id}`);

export const getReviewsByGame = (id) => request(`/games/${id}/reviews`);

export const createReview = (id, data, token) =>
  request(`/games/${id}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const createGame = (payload, token) =>
  request('/games', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateGame = (id, payload, token) =>
  request(`/games/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteGame = (id, token) =>
  request(`/games/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteReview = (reviewId, token) =>
  request(`/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getLogs = (token, limit = 200) =>
  request(`/logs?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const sendChatMessage = (message) =>
  request('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
