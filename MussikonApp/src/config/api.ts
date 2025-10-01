// Configuración de la API
import axios from 'axios';
// export const URL_SERVER = 'http://192.168.100.101:3000';
export const URL_SERVER = 'http://192.168.56.130:3000';
// export const URL_SERVER = 'http://172.20.10.4:3000';
const API_BASE_URL = `${URL_SERVER}/api`;

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // Aquí se agregará el token cuando implementemos la autenticación
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Redirigir al login
      console.log('Token expirado, redirigir al login');
    }
    
    return Promise.reject(error);
  }
);

export default api;

