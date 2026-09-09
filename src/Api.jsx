import axios from 'axios';
import { BACKEND_URL } from './config';

const API = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;