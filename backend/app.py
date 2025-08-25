
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
from bs4 import BeautifulSoup
from io import StringIO

app = Flask(__name__)
CORS(app)

# Health check simple que no depende de servicios externos
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

# Endpoint para obtener carreras
@app.route('/api/carreras', methods=['GET'])
def get_carreras():
    try:
        url = "http://ccomputo.unsaac.edu.pe/index.php?op=catalog"
        print(f"[GET CARRERAS] Consultando: {url}")
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        print(f"[GET CARRERAS] Status code: {response.status_code}")
        print(f"[GET CARRERAS] Content length: {len(response.text)}")
        
        response.encoding = "latin-1"
        soup = BeautifulSoup(response.text, "html.parser")
        tabla = soup.find("table")
        
        carreras = []
        if tabla:
            rows = tabla.find_all("tr")[1:]  # Saltar el header
            print(f"[GET CARRERAS] Filas encontradas: {len(rows)}")
            
            for i, row in enumerate(rows):
                try:
                    cols = row.find_all("td")
                    if len(cols) >= 2:
                        nombre = cols[1].get_text(strip=True)
                        link_tag = cols[2].find("a")
                        if link_tag and link_tag.has_attr("href"):
                            link = link_tag["href"]
                            if not link.startswith("http"):
                                link = "http://ccomputo.unsaac.edu.pe/" + link
                            carreras.append({"nombre": nombre, "link": link})
                            print(f"[GET CARRERAS] Carrera {i+1}: {nombre} -> {link}")
                except Exception as e:
                    print(f"[GET CARRERAS] Error procesando fila {i+1}: {str(e)}")
                    continue
        else:
            print("[GET CARRERAS] No se encontró tabla")
            
        print(f"[GET CARRERAS] Total de carreras: {len(carreras)}")
        return jsonify(carreras)
        
    except requests.exceptions.RequestException as e:
        print(f"[GET CARRERAS] Error de requests: {str(e)}")
        return jsonify({"error": f"Error al hacer request: {str(e)}"}), 500
    except Exception as e:
        print(f"[GET CARRERAS] Error general: {str(e)}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

# Endpoint para obtener cursos de una carrera (por link)
@app.route('/api/cursos', methods=['GET'])
def get_cursos():
    try:
        link = request.args.get('link')
        if not link:
            return jsonify({"error": "Link no proporcionado"}), 400
        
        print(f"[GET CURSOS] Procesando link: {link}")
        
        # Decodificar la URL si viene codificada
        import urllib.parse
        decoded_link = urllib.parse.unquote(link)
        print(f"[GET CURSOS] Link decodificado: {decoded_link}")
        
        response = requests.get(decoded_link, timeout=30)
        response.raise_for_status()  # Lanzar error si la respuesta no es exitosa
        
        print(f"[GET CURSOS] Status code: {response.status_code}")
        print(f"[GET CURSOS] Content length: {len(response.text)}")
        
        response.encoding = "latin-1"
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Buscar todas las tablas
        tablas = soup.find_all("table")
        print(f"[GET CURSOS] Tablas encontradas: {len(tablas)}")
        
        cursos = []
        for i, tabla in enumerate(tablas):
            try:
                print(f"[GET CURSOS] Procesando tabla {i+1}")
                df = pd.read_html(StringIO(str(tabla)), header=0)[0]
                print(f"[GET CURSOS] Columnas de tabla {i+1}: {df.columns.tolist()}")
                
                # Buscar columna de cursos
                if "CURSO" in df.columns:
                    cursos_encontrados = df["CURSO"].dropna().unique().tolist()
                    print(f"[GET CURSOS] Cursos encontrados en tabla {i+1}: {cursos_encontrados}")
                    cursos.extend(cursos_encontrados)
                elif "CODIGO" in df.columns:
                    cursos_encontrados = df["CODIGO"].dropna().unique().tolist()
                    print(f"[GET CURSOS] Códigos encontrados en tabla {i+1}: {cursos_encontrados}")
                    cursos.extend(cursos_encontrados)
                    
            except Exception as e:
                print(f"[GET CURSOS] Error procesando tabla {i+1}: {str(e)}")
                continue
        
        # Eliminar duplicados y valores vacíos
        cursos = list(set([str(curso).strip() for curso in cursos if str(curso).strip()]))
        print(f"[GET CURSOS] Total de cursos únicos: {len(cursos)}")
        print(f"[GET CURSOS] Cursos: {cursos}")
        
        return jsonify(cursos)
        
    except requests.exceptions.RequestException as e:
        print(f"[GET CURSOS] Error de requests: {str(e)}")
        return jsonify({"error": f"Error al hacer request: {str(e)}"}), 500
    except Exception as e:
        print(f"[GET CURSOS] Error general: {str(e)}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

# Endpoint para buscar alumnos en un curso
@app.route('/api/alumnos', methods=['GET'])
def get_alumnos():
    curso = request.args.get('curso')
    semestre = request.args.get('semestre', '2025-2')
    filtro = request.args.get('filtro', '').strip().lower()
    url = "http://ccomputo.unsaac.edu.pe/?op=alcurso"
    data = {"curso": curso, "semestre": semestre}
 
    response = requests.post(url, data=data)
    response.encoding = "latin-1"
    soup = BeautifulSoup(response.text, "html.parser")
    tablas = soup.find_all("table", class_="ttexto")
    
    alumnos = []
    if tablas:
        df = pd.read_html(StringIO(str(tablas[-1])), header=0)[0]
       
    # Convertir todo el DataFrame a minúsculas para evitar problemas de coincidencia
    df_lower = df.apply(lambda col: col.map(lambda x: str(x).lower() if isinstance(x, str) else x))
    alumnos = df_lower.to_dict(orient='records')
    cursos_encontrados = []
    if filtro:
        columnas = df.columns.tolist()
        alumnos_filtrados = []
        for a in alumnos:
            if any(filtro in str(a.get(col, '')).lower() for col in columnas):
                alumnos_filtrados.append(a)
        alumnos = alumnos_filtrados
    else:
        
        print("[GET ALUMNOS] No se encontraron tablas de alumnos.")
    # Reemplazar NaN por None para evitar errores de JSON
    import math
    def clean_nan(obj):
        if isinstance(obj, float) and math.isnan(obj):
            return None
        if isinstance(obj, dict):
            return {k: clean_nan(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [clean_nan(x) for x in obj]
        return obj
    alumnos = clean_nan(alumnos)
    # Imprimir la lista completa de alumnos encontrados en el curso
    print(f"CURSO:{curso}: {alumnos}")
    return jsonify(alumnos)

# Endpoint para extraer y filtrar horarios de cursos
@app.route('/api/horarios')
def api_horarios():
    # Obtener parámetros
    url = request.args.get('link', '').strip()
    codigos = request.args.get('codigos', '')
    codigos_lista = [c.strip() for c in codigos.split(',') if c.strip()]
    if not url or not codigos_lista:
        return {'error': 'Faltan parámetros'}, 400

    response = requests.get(url)
    response.encoding = "latin-1"
    soup = BeautifulSoup(response.text, "html.parser")

    cursos = []
    curso_actual = None

    for row in soup.select("table tr"):
        cols = [td.get_text(strip=True) for td in row.find_all("td")]
        if not cols:
            continue
        if "Docente" in cols:
            continue

        # Si la primera columna es un número → es un nuevo curso
        if cols[0].isdigit():
            if curso_actual:
                cursos.append(curso_actual)

            curso_actual = {
                "nro": cols[0],
                "codigo": cols[1],
                "nombre": cols[2],
                "creditos": cols[4] if len(cols) > 4 else '',
                "tipo": cols[5] if len(cols) > 5 else '',
                "plan": cols[-1],
                "horarios": []
            }
        else:
            if curso_actual and len(cols) >= 3:
                hora = next((c for c in cols if "[" in c and "]" in c), "")
                aula = cols[-2]
                dia = next((c for c in cols if c in ["LU", "MA", "MI", "JU", "VI"]), "")
                if dia and hora:
                    curso_actual["horarios"].append({
                        "dia": dia,
                        "hora": hora,
                        "aula": aula
                    })

    if curso_actual:
        cursos.append(curso_actual)

    # Filtrar SOLO los cursos que están en codigos_lista
    cursos_filtrados = [c for c in cursos if c["codigo"] in codigos_lista]

    return jsonify(cursos_filtrados)
if __name__ == '__main__':
    app.run(debug=True)
