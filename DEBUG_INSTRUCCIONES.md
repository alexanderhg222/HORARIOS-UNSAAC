# 🐛 Instrucciones para Debuggear el Problema de Cursos

## 🔍 **Problema Identificado:**
Los cursos de la carrera no se están cargando correctamente.

## 🧪 **Pasos para Debuggear:**

### 1. **Abrir la Consola del Navegador**
- Presiona `F12` o `Ctrl+Shift+I`
- Ve a la pestaña **Console**

### 2. **Probar la Conexión con el Backend**
- Haz clic en el botón **"🧪 Probar Conexión con Backend"**
- Revisa los logs en la consola
- Deberías ver:
  ```
  🔧 API_BASE_URL: https://migrada-backend.onrender.com
  🔧 Endpoint: /api/carreras
  🔧 Params: {}
  🔧 URL final construida: https://migrada-backend.onrender.com/api/carreras
  🧪 Probando conexión con: https://migrada-backend.onrender.com/api/carreras
  📡 Respuesta del servidor (carreras): 200 OK
  📊 Carreras recibidas: [array de carreras]
  ✅ Conexión exitosa: [array de carreras]
  ```

### 3. **Seleccionar una Carrera**
- Selecciona una carrera del dropdown
- Revisa los logs en la consola
- Deberías ver:
  ```
  🔍 URL de la API para cursos: https://migrada-backend.onrender.com/api/cursos?link=URL_DE_LA_CARRERA
  🔍 Carrera seleccionada: URL_DE_LA_CARRERA
  📡 Respuesta del servidor: 200 OK
  📊 Datos recibidos: [array de cursos]
  ```

### 4. **Posibles Errores y Soluciones:**

#### ❌ **Error: "Failed to fetch"**
- **Causa**: El backend no está respondiendo
- **Solución**: Verificar que el backend esté funcionando en Render

#### ❌ **Error: "CORS"**
- **Causa**: Problema de CORS en el backend
- **Solución**: El backend ya tiene CORS habilitado

#### ❌ **Error: "404 Not Found"**
- **Causa**: Endpoint incorrecto
- **Solución**: Verificar que la URL del backend sea correcta

#### ❌ **Error: "500 Internal Server Error"**
- **Causa**: Error en el backend
- **Solución**: Revisar logs del backend en Render

## 🔧 **Verificar Backend en Render:**

1. Ve a [render.com](https://render.com)
2. Accede a tu servicio `migrada-backend`
3. Ve a la pestaña **Logs**
4. Verifica que no haya errores

## 📱 **Probar Endpoints Directamente:**

### Endpoint de Salud:
```
https://migrada-backend.onrender.com/health
```
**Respuesta esperada:** `{"status": "ok"}`

### Endpoint de Carreras:
```
https://migrada-backend.onrender.com/api/carreras
```
**Respuesta esperada:** Array de carreras

### Endpoint de Cursos:
```
https://migrada-backend.onrender.com/api/cursos?link=URL_DE_CARRERA
```
**Respuesta esperada:** Array de cursos

## 🚀 **Si Todo Funciona:**

1. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "Agregar logs de debug y botón de prueba"
   git push origin main
   ```

2. **Desplegar en Netlify:**
   - El build se hará automáticamente
   - Configurar variable de entorno: `VITE_API_URL = https://migrada-backend.onrender.com`

## 📞 **Si Persiste el Problema:**

1. **Compartir logs de la consola**
2. **Verificar estado del backend en Render**
3. **Probar endpoints directamente en el navegador**
4. **Revisar si hay problemas de red o firewall**
