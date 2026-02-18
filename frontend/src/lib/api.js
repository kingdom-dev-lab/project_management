import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
});

export function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('accessToken');
  const teamId = localStorage.getItem('teamId');
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'x-team-id': teamId || ''
  };
}
