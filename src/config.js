// Configuración de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://migrada-backend.onrender.com';

// Endpoints de la API
export const API_ENDPOINTS = {
  carreras: '/api/carreras',
  cursos: '/api/cursos',
  alumnos: '/api/alumnos',
  horarios: '/api/horarios'
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint, params = {}) => {
  const url = new URL(API_BASE_URL + endpoint);
  
  // Agregar parámetros de query
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};
