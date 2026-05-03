import axios from 'axios';
import { formatAxiosError } from './errors';

const api = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.friendlyMessage = formatAxiosError(error);
    return Promise.reject(error);
  },
);

export default api;
