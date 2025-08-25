
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
from bs4 import BeautifulSoup
from io import StringIO

app = Flask(__name__)
CORS(app)

# Endpoint para obtener carreras
@app.route('/api/carreras', methods=['GET'])
def get_carreras():
    url = "http://ccomputo.unsaac.edu.pe/index.php?op=catalog"
    response = requests.get(url)
    response.encoding = "latin-1"
    soup = BeautifulSoup(response.text, "html.parser")
    tabla = soup.find("table")
    carreras = []
    if tabla:
        for row in tabla.find_all("tr")[1:]:
            cols = row.find_all("td")
            if len(cols) >= 2:
                nombre = cols[1].get_text(strip=True)
                link_tag = cols[2].find("a")
                if link_tag and link_tag.has_attr("href"):
                    link = link_tag["href"]
                    if not link.startswith("http"):
                        link = "http://ccomputo.unsaac.edu.pe/" + link
                    carreras.append({"nombre": nombre, "link": link})
    return jsonify(carreras)

# Endpoint para obtener cursos de una carrera (por link)
@app.route('/api/cursos', methods=['GET'])
def get_cursos():
    link = request.args.get('link')
    if not link:
        return jsonify([])
    response = requests.get(link)
    response.encoding = "latin-1"
    soup = BeautifulSoup(response.text, "html.parser")
    tabla = soup.find("table")
    cursos = []
    if tabla:
        df = pd.read_html(StringIO(str(tabla)), header=0)[0]
        if "CURSO" in df.columns:
            cursos = df["CURSO"].dropna().unique().tolist()
    return jsonify(cursos)

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
