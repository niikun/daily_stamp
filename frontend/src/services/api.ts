import axios from 'axios';
import { AuthResponse, Profile, Brush, ChatResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (name: string, email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/signup', { name, email, password }).then(res => res.data),
  
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(res => res.data),
};

export const profileAPI = {
  getProfile: (): Promise<Profile> =>
    api.get('/profile').then(res => res.data),
  
  updateProfile: (character_name: string): Promise<Profile> =>
    api.put('/profile', { character_name }).then(res => res.data),
};

export const brushAPI = {
  getBrushesByMonth: (month: string): Promise<Brush[]> =>
    api.get(`/brushes?month=${month}`).then(res => res.data),
  
  createBrush: (date: string, stamps: string[]): Promise<Brush> =>
    api.post('/brushes', { date, stamps }).then(res => res.data),
};

export const chatAPI = {
  sendMessage: (message: string, context?: string): Promise<ChatResponse> =>
    api.post('/chat', { message, context }).then(res => res.data),
};

export default api;