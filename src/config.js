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
  try {
    // Debug: mostrar la URL base
    console.log('🔧 API_BASE_URL:', API_BASE_URL);
    console.log('🔧 Endpoint:', endpoint);
    console.log('🔧 Params:', params);
    
    const url = new URL(API_BASE_URL + endpoint);
    
    // Agregar parámetros de query
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    
    const finalUrl = url.toString();
    console.log('🔧 URL final construida:', finalUrl);
    
    return finalUrl;
  } catch (error) {
    console.error('❌ Error construyendo URL:', error);
    // Fallback: construir URL simple
    const baseUrl = API_BASE_URL + endpoint;
    if (Object.keys(params).length === 0) {
      return baseUrl;
    }
    
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
};
