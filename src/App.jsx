import { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { buildApiUrl, API_ENDPOINTS } from './config';

// Componente Loader de pantalla completa
const FullScreenLoader = ({ message = "Cargando...", progress = null }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 min-w-80">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
        </div>
        <div className="text-lg font-semibold text-gray-700 text-center">{message}</div>
        
        {/* Barra de progreso */}
        {progress !== null && (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-500">Por favor espere...</div>
      </div>
    </div>
  );
};

// Componente Loader pequeño para elementos específicos
const SmallLoader = ({ message = "Cargando..." }) => {
  return (
    <div className="flex items-center space-x-2 text-blue-600">
      <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <span className="text-sm">{message}</span>
    </div>
  );
};

function App() {

  // Estado para guardar los horarios consultados
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [carrera, setCarrera] = useState('');
  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [progresoHorarios, setProgresoHorarios] = useState(0);
  const [progresoBusqueda, setProgresoBusqueda] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);



  // Función para generar y descargar imagen del horario
  const descargarHorarioImagen = async () => {
    if (!horarios || horarios.length === 0) return;

    try {
      // Buscar solo la tabla, no todo el modal
      const tablaElement = document.querySelector('.modal-horario-tabla');
      if (!tablaElement) {
        alert('No se pudo encontrar la tabla para convertir');
        return;
      }

      // Crear un contenedor temporal solo con la tabla
      const contenedorTemp = document.createElement('div');
      contenedorTemp.style.position = 'absolute';
      contenedorTemp.style.left = '-9999px';
      contenedorTemp.style.top = '-9999px';
      contenedorTemp.style.backgroundColor = '#ffffff';
      contenedorTemp.style.padding = '5px';
      contenedorTemp.style.fontFamily = 'Arial, sans-serif';
      contenedorTemp.style.width = '1123px'; // A4 horizontal (297mm = 1123px a 96 DPI)
      contenedorTemp.style.height = '794px';  // A4 horizontal (210mm = 794px a 96 DPI)
      contenedorTemp.style.boxSizing = 'border-box';
      contenedorTemp.style.overflow = 'hidden';
      
      // Agregar título y datos del alumno
      const titulo = document.createElement('h2');
      titulo.textContent = 'Horarios de Cursos';
      titulo.style.fontSize = '20px';
      titulo.style.fontWeight = 'bold';
      titulo.style.color = '#1e40af';
      titulo.style.textAlign = 'center';
      titulo.style.marginBottom = '5px';
      titulo.style.marginTop = '0px';
      contenedorTemp.appendChild(titulo);
      
      // Agregar datos del alumno
      if (resultados && resultados.length > 0) {
        const datosAlumno = document.createElement('div');
        datosAlumno.style.textAlign = 'center';
        datosAlumno.style.marginBottom = '10px';
        datosAlumno.style.fontSize = '16px';
        datosAlumno.style.color = '#4b5563';
        
        const nombre = document.createElement('div');
        nombre.innerHTML = `<strong>Alumno:</strong> ${resultados[0].Nombres || resultados[0].nombres || 'N/A'}`;
        nombre.style.textTransform = 'uppercase';
        nombre.style.marginBottom = '8px';
        datosAlumno.appendChild(nombre);
        
        const codigo = document.createElement('div');
        codigo.innerHTML = `<strong>Código:</strong> ${resultados[0].Alumno || resultados[0].alumno || 'N/A'}`;
        datosAlumno.appendChild(codigo);
        
        contenedorTemp.appendChild(datosAlumno);
      }
      
      // Clonar la tabla y ajustar estilos para A4 horizontal
      const tablaClonada = tablaElement.cloneNode(true);
      tablaClonada.style.width = '100%';
      tablaClonada.style.fontSize = '14px';
      tablaClonada.style.borderCollapse = 'collapse';
      tablaClonada.style.marginTop = '20px';
      
      // Ajustar estilos de las celdas para mejor visualización
      const celdas = tablaClonada.querySelectorAll('td, th');
      celdas.forEach(celda => {
        celda.style.padding = '12px 8px';
        celda.style.border = '2px solid #374151';
        celda.style.textAlign = 'center';
        celda.style.verticalAlign = 'middle';
      });
      
      // Ajustar encabezados
      const encabezados = tablaClonada.querySelectorAll('th');
      encabezados.forEach(encabezado => {
        encabezado.style.backgroundColor = '#1e40af';
        encabezado.style.color = 'white';
        encabezado.style.fontWeight = 'bold';
        encabezado.style.fontSize = '16px';
      });
      
      contenedorTemp.appendChild(tablaClonada);
      
      // Agregar al DOM temporalmente
      document.body.appendChild(contenedorTemp);
      
      // Convertir HTML a canvas
      const canvas = await html2canvas(contenedorTemp, {
        backgroundColor: '#ffffff',
        scale: 2, // Mejor calidad
        useCORS: true,
        allowTaint: true,
        width: contenedorTemp.scrollWidth,
        height: contenedorTemp.scrollHeight
      });
      
      // Limpiar el contenedor temporal
      document.body.removeChild(contenedorTemp);

      // Crear enlace de descarga con nombre personalizado
      const link = document.createElement('a');
      
      // Obtener el nombre del alumno para el nombre del archivo
      let nombreAlumno = 'Alumno';
      if (resultados && resultados.length > 0) {
        const alumno = resultados[0].Nombres || resultados[0].nombres || 'Alumno';
        nombreAlumno = alumno.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-');
        nombreAlumno.toUpperCase();
      }
      
      link.download = `HORARIO-${nombreAlumno}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Descargar imagen
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
     
      alert('Error al generar la imagen del horario');
    }
  };

  useEffect(() => {
    setLoading(true);
    
    // Debug: mostrar la URL que se está construyendo
    const apiUrl = buildApiUrl(API_ENDPOINTS.carreras);
   
    
    fetch(apiUrl)
      .then(res => {
      
        return res.json();
      })
      .then(data => {
        
        setCarreras(data);
        setCarrera('');
      })
      .catch(error => {
        
        setCarreras([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch courses when a career is selected
  useEffect(() => {
    if (!carrera) {
      setCursos([]);
      setShowModal(false);
      return;
    }
    setLoadingCursos(true);
    
    // Debug: mostrar la URL que se está construyendo
    const apiUrl = buildApiUrl(API_ENDPOINTS.cursos, { link: carrera });
   
    
    fetch(apiUrl)
      .then(res => {
       
        return res.json();
      })
      .then(data => {
        
        setCursos(data);
        setShowModal(true);
      })
      .catch(error => {
        
        setCursos([]);
      })
      .finally(() => setLoadingCursos(false));
  }, [carrera]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-xl bg-white rounded-lg shadow p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">Consulta de Horarios - Alumnos UNSAAC</h1>
        
        <div className="flex flex-col gap-4">
          <label className="font-semibold">Seleccione su carrera:</label>
          {loading ? (
            <SmallLoader message="Cargando carreras..." />
          ) : (
            <select
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={carrera}
              onChange={e => setCarrera(e.target.value)}
            >
              <option value="">SELECCIONE SU CARRERA</option>
              {carreras.map((c, i) => (
                <option key={i} value={c.link}>{c.nombre}</option>
              ))}
            </select>
          )}
        </div>
        {/* Loader de pantalla completa para cursos */}
        {loadingCursos && (
          <FullScreenLoader message="Cargando cursos de la carrera..." />
        )}
        
        {/* Loader de pantalla completa para búsqueda */}
        {buscando && (
          <FullScreenLoader 
            message="Buscando alumnos en todos los cursos..." 
            progress={progresoBusqueda}
          />
        )}
        
        {/* Loader de pantalla completa para horarios */}
        {loadingHorarios && (
          <FullScreenLoader 
            message="Consultando horarios de los cursos..." 
            progress={progresoHorarios}
          />
        )}
        
        {/* Modal de cursos */}
        {showModal && !loadingCursos && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4 text-blue-700 text-center">CURSOS DE CARRERA CARGADA</h2>
              {cursos.length > 0 ? (
                <ul className="list-disc pl-5 max-h-80 overflow-y-auto w-full mb-4">
                  {cursos.map((curso, i) => (
                    <li key={i}>{curso}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 mb-4">No hay cursos para esta carrera.</div>
              )}
              <button
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-1 rounded font-bold mt-2"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
              >
                SALIR
              </button>
            </div>
          </div>
        )}
        
        {/* Label de cursos cargados */}
        {!showModal && cursos.length > 0 && !loadingCursos && (
          <div className="w-full bg-green-100 border-2 border-green-500 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-green-800 font-bold text-lg">✓ CURSOS CARGADOS</span>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-green-700 text-sm mt-1">
              {cursos.length} curso{cursos.length !== 1 ? 's' : ''} disponible{cursos.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <label className="font-semibold text-center text-blue-700">BUSCAR: CODIGO-NOMBRES:</label>
          <label className="font-semibold">Ejm:   149657 // HUAMAN-PEREZ-ANASTACIO</label>
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Ingrese nombre o código..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
            if (!filtro.trim() || cursos.length === 0) {
              setResultados([]);
              return;
            }
            setBuscando(true);
            setProgresoBusqueda(0);
            let resultadosTotales = [];
            
            for (let i = 0; i < cursos.length; i++) {
              const curso = cursos[i];
              try {
                // Actualizar progreso basado en el curso actual
                const progreso = ((i + 1) / cursos.length) * 100;
                setProgresoBusqueda(progreso);
                
                const res = await fetch(buildApiUrl(API_ENDPOINTS.alumnos, { curso, filtro }));
                const data = await res.json();
             
                if (Array.isArray(data)) {
                  // Agrega el campo Curso a cada resultado
                  const dataConCurso = data.map(obj => ({ ...obj, Curso: curso }));
                  resultadosTotales = resultadosTotales.concat(dataConCurso);
                }
              } catch (e) {
                console.error(`Error consultando curso ${curso}:`, e);
              }
            }
            
            // Reinicia la tabla con los nuevos resultados
            if (resultadosTotales.length > 0) {
              setResultados(resultadosTotales);
             
            } else {
              setResultados([]);
             
            }
            setBuscando(false);
            setProgresoBusqueda(0);
          }}
          disabled={loading || buscando}
        >
          {buscando ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Buscando...</span>
            </div>
          ) : (
            'Aplicar filtro'
          )}
        </button>
        {/* Resultados de búsqueda */}
        {resultados.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold mb-2">Resultados encontrados:</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-2 py-1">Curso</th>
                    <th className="border px-2 py-1">Nro</th>
                    <th className="border px-2 py-1">Alumno</th>
                    <th className="border px-2 py-1">Nombres</th>
                    <th className="border px-2 py-1">Obs.</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{r.Curso ?? ''}</td>
                      <td className="border px-2 py-1">{r.Nro ?? r.nro ?? ''}</td>
                      <td className="border px-2 py-1">{r.Alumno ?? r.alumno ?? ''}</td>
                      <td className="border px-2 py-1">{r.Nombres ?? r.nombres ?? ''}</td>
                      <td className="border px-2 py-1">{r["Obs."] ?? r.obs ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
         {/* Botón para consultar horarios de los cursos encontrados */}
        {resultados.length > 0 && (
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={async () => {
              const codigos = [...new Set(resultados.map(r => r.Curso))].join(",");
              if (!carrera || !codigos) {
                alert("Faltan datos para consultar horarios");
                return;
              }
              
              setLoadingHorarios(true);
              setProgresoHorarios(0);
              
              try {
                // Simular progreso de la consulta
                const totalSteps = 4; // Pasos de la consulta
                let currentStep = 0;
                
                // Paso 1: Iniciando consulta
                currentStep++;
                setProgresoHorarios((currentStep / totalSteps) * 100);
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Paso 2: Conectando con la API
                currentStep++;
                setProgresoHorarios((currentStep / totalSteps) * 100);
                await new Promise(resolve => setTimeout(resolve, 400));
                
                // Paso 3: Procesando datos
                currentStep++;
                setProgresoHorarios((currentStep / totalSteps) * 100);
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const res = await fetch(buildApiUrl(API_ENDPOINTS.horarios, { link: carrera, codigos }));
                const data = await res.json();
                
                // Paso 4: Completado
                currentStep++;
                setProgresoHorarios((currentStep / totalSteps) * 100);
                await new Promise(resolve => setTimeout(resolve, 200));
                
                setHorarios(data);
                setShowHorarioModal(true);
           
              } catch (e) {
                alert("Error al consultar horarios");
              } finally {
                setLoadingHorarios(false);
                setProgresoHorarios(0);
              }
            }}
            disabled={loadingHorarios}
          >
            {loadingHorarios ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Consultando horarios...</span>
              </div>
            ) : (
              'Consultar horarios de los cursos encontrados'
            )}
          </button>
        )}
        {/* Modal de horarios tipo calendario */}
        {showHorarioModal && horarios.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl relative imagen-horario">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-blue-700">Horarios de Cursos</h2>
                {resultados.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <div className='uppercase'><strong>Alumno:</strong> {resultados[0].Nombres || resultados[0].nombres || 'N/A'}</div>
                    <div><strong>Código:</strong> {resultados[0].Alumno || resultados[0].alumno || 'N/A'}</div>
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold"
                  onClick={descargarHorarioImagen}
                >
                  🖼️ Descargar Imagen
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => setShowHorarioModal(false)}
                >
                  Cerrar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-xs modal-horario-tabla">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-2 py-1">Hora</th>
                      <th className="border px-2 py-1">LU</th>
                      <th className="border px-2 py-1">MA</th>
                      <th className="border px-2 py-1">MI</th>
                      <th className="border px-2 py-1">JU</th>
                      <th className="border px-2 py-1">VI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Construir matriz de horario */}
                    {(() => {
                      // Extraer todas las horas únicas
                      const horasSet = new Set();
                      horarios.forEach(curso => {
                        curso.horarios.forEach(h => horasSet.add(h.hora));
                      });
                      const horas = Array.from(horasSet).sort();
                      const dias = ["LU", "MA", "MI", "JU", "VI"];
                      return horas.map((hora, idx) => (
                        <tr key={hora}>
                          <td className="border px-2 py-1 font-bold">{hora}</td>
                          {dias.map(dia => {
                            // Buscar si hay curso en ese día/hora
                            const cursoEnCelda = horarios.find(curso =>
                              curso.horarios.some(h => h.hora === hora && h.dia === dia)
                            );
                            if (cursoEnCelda) {
                              const hInfo = cursoEnCelda.horarios.find(h => h.hora === hora && h.dia === dia);
                              
                              // Generar color único basado en el código del curso
                              const getColorForCourse = (codigo) => {
                                const colors = [
                                  'bg-blue-100 border-l-4 border-blue-500',
                                  'bg-green-100 border-l-4 border-green-500',
                                  'bg-yellow-100 border-l-4 border-yellow-500',
                                  'bg-purple-100 border-l-4 border-purple-500',
                                  'bg-pink-100 border-l-4 border-pink-500',
                                  'bg-indigo-100 border-l-4 border-indigo-500',
                                  'bg-red-100 border-l-4 border-red-500',
                                  'bg-teal-100 border-l-4 border-teal-500',
                                  'bg-orange-100 border-l-4 border-orange-500',
                                  'bg-cyan-100 border-l-4 border-cyan-500'
                                ];
                                
                                // Usar el código del curso para seleccionar color de manera consistente
                                const hash = codigo.split('').reduce((a, b) => {
                                  a = ((a << 5) - a) + b.charCodeAt(0);
                                  return a & a;
                                }, 0);
                                return colors[Math.abs(hash) % colors.length];
                              };
                              
                              const colorClass = getColorForCourse(cursoEnCelda.codigo);
                              
                              return (
                                <td key={dia} className={`border px-2 py-1 align-top ${colorClass}`}>
                                  <div className="font-semibold text-xs">{cursoEnCelda.nombre}</div>
                                  <div className="text-xs text-gray-700">{cursoEnCelda.codigo}</div>
                                  <div className="text-xs text-gray-600">Aula: {hInfo.aula}</div>
                                </td>
                              );
                            } else {
                              return <td key={dia} className="border px-2 py-1"></td>;
                            }
                          })}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
