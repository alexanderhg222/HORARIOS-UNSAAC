# 🎓 MIGRADA - Sistema de Gestión Académica

**MIGRADA** es una aplicación web full-stack diseñada para la gestión y consulta de información académica de la Universidad Nacional de San Antonio Abad del Cusco (UNSAAC). El sistema permite consultar carreras, cursos, alumnos y horarios de manera eficiente y organizada.

## ✨ Características Principales

- 🔍 **Consulta de Carreras**: Lista completa de carreras disponibles en la UNSAAC
- 📚 **Gestión de Cursos**: Búsqueda y filtrado de cursos por carrera
- 👥 **Consulta de Alumnos**: Búsqueda de estudiantes por curso y semestre
- ⏰ **Horarios Académicos**: Visualización y exportación de horarios de cursos
- 📊 **Exportación de Datos**: Generación de imágenes en formato A4 para impresión
- 🌐 **API REST**: Backend robusto con endpoints bien documentados
- 🎨 **Interfaz Moderna**: Frontend responsive con React y Tailwind CSS

## 🏗️ Arquitectura del Sistema

### Frontend
- **React 19** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **HTML2Canvas** - Generación de imágenes para exportación

### Backend
- **Flask** - Framework web de Python
- **Flask-CORS** - Soporte para CORS
- **Pandas** - Manipulación y análisis de datos
- **BeautifulSoup4** - Web scraping y parsing HTML
- **Requests** - Cliente HTTP para Python

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd MIGRADA
```

### 2. Configurar el Frontend
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### 3. Configurar el Backend
```bash
# Navegar al directorio del backend
cd backend

# Crear entorno virtual (recomendado)
python -m venv .venv

# Activar entorno virtual
# En Windows:
.venv\Scripts\activate
# En macOS/Linux:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar la aplicación
python app.py
```

## 📡 API Endpoints

### Carreras
- `GET /api/carreras` - Obtiene lista de todas las carreras disponibles

### Cursos
- `GET /api/cursos?link={url}` - Obtiene cursos de una carrera específica

### Alumnos
- `GET /api/alumnos?curso={codigo}&semestre={semestre}&filtro={texto}` - Busca alumnos en un curso

### Horarios
- `GET /api/horarios?link={url}&codigos={codigo1,codigo2}` - Obtiene horarios de cursos específicos

## 🎯 Funcionalidades del Sistema

### 1. Consulta de Carreras
- Lista completa de carreras de la UNSAAC
- Enlaces directos a información detallada
- Interfaz intuitiva y responsive

### 2. Gestión de Cursos
- Búsqueda por carrera seleccionada
- Filtrado y organización de información
- Carga dinámica de datos

### 3. Búsqueda de Alumnos
- Filtrado por curso y semestre
- Búsqueda por texto en cualquier campo
- Resultados en tiempo real

### 4. Visualización de Horarios
- Tabla organizada por días y horarios
- Información de aulas y docentes
- Exportación en formato imagen A4

### 5. Exportación de Datos
- Generación de imágenes de alta calidad
- Formato optimizado para impresión
- Inclusión de datos del alumno

## 🔧 Configuración del Entorno

### Variables de Entorno

#### Backend (Flask)
Crear archivo `.env` en el directorio `backend/`:
```env
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```

#### Frontend (React)
Para producción, configurar en Netlify:
- Ve a **Site settings** → **Environment variables**
- Agrega: `VITE_API_URL` = `https://migrada-backend.onrender.com`

Para desarrollo local, crear archivo `.env` en el directorio raíz:
```env
VITE_API_URL=https://migrada-backend.onrender.com
```

### Configuración de CORS
El backend está configurado para permitir peticiones desde cualquier origen (CORS habilitado).

### Backend Desplegado
El backend está configurado para usar la URL de producción por defecto:
- **URL de Producción**: `https://migrada-backend.onrender.com`
- **Health Check**: `/health`
- **Endpoints disponibles**: `/api/carreras`, `/api/cursos`, `/api/alumnos`, `/api/horarios`

## 📱 Uso del Sistema

### 1. Seleccionar Carrera
- Navegar a la página principal
- Seleccionar una carrera del listado disponible

### 2. Consultar Cursos
- Ver lista de cursos de la carrera seleccionada
- Identificar códigos de cursos de interés

### 3. Buscar Alumnos
- Ingresar código del curso
- Seleccionar semestre
- Aplicar filtros de búsqueda si es necesario

### 4. Visualizar Horarios
- Consultar horarios de cursos específicos
- Revisar disponibilidad de horarios y aulas

### 5. Exportar Información
- Generar imagen del horario
- Descargar en formato A4 para impresión

## 🛠️ Desarrollo

### Estructura del Proyecto
```
MIGRADA/
├── backend/           # API Flask
│   ├── app.py        # Aplicación principal
│   └── requirements.txt
├── src/              # Código fuente React
│   ├── App.jsx      # Componente principal
│   └── ...
├── public/           # Archivos estáticos
└── package.json      # Dependencias Node.js
```

### Scripts Disponibles
```bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run preview      # Vista previa
npm run lint         # Linting
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Equipo de Desarrollo MIGRADA**
- Universidad Nacional de San Antonio Abad del Cusco

## 🆘 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

## 🔄 Changelog

### Versión 1.0.0
- ✅ Sistema base de consulta de carreras
- ✅ Gestión de cursos por carrera
- ✅ Búsqueda de alumnos
- ✅ Visualización de horarios
- ✅ Exportación de datos en formato imagen

---

**MIGRADA** - Transformando la gestión académica de la UNSAAC 🚀