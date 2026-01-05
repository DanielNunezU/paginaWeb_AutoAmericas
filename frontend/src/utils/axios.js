import axios from 'axios';

// Configurar axios para incluir el token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Manejar errores de autenticación
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');

      // Solo redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('/admin')) {
        window.location.href = '/admin';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
