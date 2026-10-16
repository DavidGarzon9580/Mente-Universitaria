# 🧠 Mente Universitaria

**Plataforma web de autocuidado, organización y bienestar estudiantil.**

Mente Universitaria es una plataforma web para estudiantes universitarios que facilita el autocuidado cotidiano, la organización personal y el acceso a recursos de bienestar. Es una iniciativa académica independiente dirigida principalmente a estudiantes de la Corporación Universitaria Minuto de Dios (UNIMINUTO).

> [!IMPORTANT]
> Mente Universitaria **no es una plataforma oficial de UNIMINUTO** y **no sustituye la atención profesional en salud mental**.

## 📌 Índice

- [Descripción](#-descripción)
- [Deslinde de responsabilidad](#️-deslinde-de-responsabilidad)
- [Planteamiento del problema](#-planteamiento-del-problema)
- [Objetivos](#-objetivos)
- [Alineación con los ODS](#-alineación-con-los-ods)
- [Funcionalidades](#️-funcionalidades)
- [Inteligencia Artificial en Mi plan](#-inteligencia-artificial-en-mi-plan)
- [Accesibilidad](#-accesibilidad)
- [Tecnologías](#️-tecnologías)
- [Arquitectura](#️-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Cómo ejecutarlo en tu computador](#-cómo-ejecutarlo-en-tu-computador)
- [Despliegue en Vercel](#-despliegue-en-vercel)
- [API](#-api)
- [Pruebas y verificaciones](#-pruebas-y-verificaciones)
- [Referencias](#-referencias)

## 🎯 Descripción

Los estudiantes universitarios enfrentan a diario factores que afectan su bienestar: carga académica, responsabilidades laborales, compromisos personales, dificultades de organización y periodos prolongados de estrés.

Mente Universitaria ofrece un espacio digital accesible donde el estudiante puede consultar recursos educativos, hacer pausas breves de autocuidado, evaluar de forma orientativa su bienestar y construir un plan personal de hábitos, con ayuda opcional de Inteligencia Artificial.

La plataforma tiene un enfoque **preventivo y educativo**: no realiza diagnósticos médicos ni psicológicos.

## ⚠️ Deslinde de responsabilidad

Mente Universitaria:

- No es una plataforma oficial ni un canal institucional de UNIMINUTO.
- No diagnostica condiciones de salud mental ni emite conceptos clínicos.
- No reemplaza la atención, el acompañamiento o la terapia de profesionales de la salud.
- Ofrece información con fines educativos, preventivos y de autocuidado.

En situaciones que requieran atención profesional o de emergencia, acude a los canales institucionales o a los servicios de emergencia de tu ciudad.

## ❓ Planteamiento del problema

Aunque existen recomendaciones, recursos y servicios de apoyo, a los estudiantes les cuesta encontrar en un solo lugar una herramienta que les permita organizar actividades de autocuidado, incorporar pausas en su jornada, consultar información de bienestar, hacer seguimiento a sus hábitos y construir una rutina adaptada a su disponibilidad.

**Pregunta central:** ¿cómo diseñar e implementar una plataforma web accesible que facilite a los estudiantes de UNIMINUTO la consulta de recursos de bienestar, la realización de actividades de autocuidado y la organización de un plan personal?

## 🎯 Objetivos

**Objetivo general:** desarrollar una plataforma web accesible y responsiva para estudiantes de UNIMINUTO que integre recursos educativos, actividades de autocuidado, una encuesta de bienestar y un generador de planes asistido por Inteligencia Artificial.

**Objetivos específicos:**

1. Diseñar la interfaz (UI/UX) y una arquitectura accesible aplicando diseño responsivo y las pautas W3C/WCAG.
2. Construir los módulos de recursos, pausas activas, encuesta de bienestar y generación de planes.
3. Implementar las funcionalidades con HTML5, CSS, JavaScript, Node.js y Express.
4. Integrar un modelo de IA (vía Groq) desde un backend propio para generar propuestas personalizadas.
5. Guardar los planes del usuario localmente con IndexedDB.
6. Incorporar herramientas de accesibilidad para adaptar la experiencia visual y de navegación.

## 🌎 Alineación con los ODS

**ODS 3 — Salud y bienestar:** garantizar una vida sana y promover el bienestar para todos en todas las edades. El proyecto contribuye desde un enfoque educativo y preventivo con herramientas digitales de autocuidado, organización personal y promoción del bienestar cotidiano.

## 🖥️ Funcionalidades

El sitio tiene seis páginas:

| Página | Descripción |
|---|---|
| 🏠 **Inicio** | Presentación de la plataforma y acceso rápido a cada sección. |
| 📋 **Encuesta** | Autoevaluación orientativa de bienestar; el resumen se puede usar en Mi plan. |
| 📚 **Recursos** | Catálogo con búsqueda y filtros, guías en HTML y PDF descargables. |
| 🧘 **Mi pausa** | Respiración guiada con temporizador y espacio de escritura libre. |
| 📅 **Mi plan** | Plan semanal con actividades manuales o propuestas por IA; exportar e importar en JSON. |
| 🆘 **Buscar apoyo** | Canales de orientación y líneas de atención. |

> [!NOTE]
> Los números y canales de atención de **Buscar apoyo** (`server/data/support-channels.json`) deben verificarse y mantenerse actualizados antes de publicar.

## 🤖 Inteligencia Artificial en Mi plan

La IA no es un chatbot ni una página aparte: está integrada en el formulario de **Mi plan**.

1. El estudiante indica objetivo, tiempo disponible por día, nivel de energía, días y, opcionalmente, notas y el resumen de la encuesta.
2. El navegador valida el formulario y lo envía al backend con `fetch`.
3. El backend vuelve a validar los datos y le pide al modelo que arme el plan usando **solo dos herramientas**:
   - `buscar_actividades`: consulta el catálogo real de actividades.
   - `componer_plan`: organiza en los días elegidos las actividades encontradas.
4. El servidor descarta cualquier actividad que no exista en el catálogo o que supere el tiempo disponible.
5. El estudiante revisa la propuesta (incluido el paso a paso de lo que hizo la IA) y decide si la guarda.
6. Si la acepta, el plan se guarda en su navegador con IndexedDB.

El proveedor es **[Groq](https://console.groq.com)** con el modelo `openai/gpt-oss-20b` (configurable). La clave vive **solo en el servidor** como variable de entorno; nunca llega al navegador.

```text
Usuario ─► Formulario Mi plan ─► fetch ─► Express (validación)
                                             │
                                             ├─► buscar_actividades ─► catálogo JSON
                                             ├─► componer_plan
                                             └─► Groq (modelo de IA)
                                             ▼
                              Propuesta ─► Usuario revisa ─► IndexedDB
```

## ♿ Accesibilidad

- **Temas:** claro, oscuro y alto contraste.
- **Tamaño del texto:** 85 %, 90 %, 95 %, 100 %, 125 %, 150 % y 200 %, más un botón para restablecer.
- Las preferencias se recuerdan en el navegador.
- Navegación completa con teclado, foco visible (`:focus-visible`) y enlace para saltar al contenido.
- Migas de pan, HTML5 semántico, un solo `h1` por página y textos alternativos en las imágenes.
- Formularios con etiquetas, mensajes de error claros y `aria-invalid`.
- Contraste verificado automáticamente (mínimo 4.5:1, WCAG AA).
- Diseño responsivo; en móvil, el botón de accesibilidad está dentro del menú.
- Se respeta `prefers-reduced-motion`.

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica y accesible. |
| CSS nativo | Variables, temas, diseño responsivo. |
| JavaScript (módulos ES) | Lógica, validación y DOM; se empaqueta con esbuild en `js/app.bundle.js`. |
| Node.js 22 + Express 5 | Servidor y API. |
| Groq API | Generación asistida de planes. |
| IndexedDB / localStorage | Planes, encuesta y preferencias en el navegador. |
| Vercel | Despliegue. |
| Git y GitHub | Control de versiones. |
| Figma | Diseño y prototipado UI/UX. |

## 🗄️ Arquitectura

```text
┌──────────── Navegador ────────────┐        ┌────────── Servidor (Express) ──────────┐
│ HTML + CSS + JavaScript           │ fetch  │ Validación                             │
│ Encuesta, Recursos, Pausa, Plan   │ ─────► │ Catálogo de recursos (JSON)            │
│ Accesibilidad                     │        │ Canales de apoyo (JSON)                │
│ IndexedDB: planes y encuesta      │        │ Agente de planes ─────► Groq API       │
└───────────────────────────────────┘        └────────────────────────────────────────┘
```

No hay cuentas de usuario ni base de datos externa: la información personal se queda en el navegador de cada estudiante.

## 📁 Estructura del proyecto

```text
Mente-Universitaria/
├── api/index.js              # Entrada de la API para Vercel
├── assets/
│   ├── guides/               # Guías en HTML
│   ├── icons/                # Logo
│   ├── images/               # Imágenes .webp
│   └── pdfs/                 # Guías en PDF
├── css/                      # comun.css + un archivo por página
├── js/
│   ├── app.js                # Punto de entrada
│   ├── app.bundle.js         # Generado con npm run build:js (no editar)
│   ├── components/           # Accesibilidad, notificaciones
│   ├── pages/                # Un controlador por página
│   ├── services/             # API e IndexedDB
│   └── utils/                # DOM y validación
├── pages/                    # encuesta, recursos, mi-pausa, mi-plan, buscar-apoyo
├── scripts/                  # Compilación y verificaciones
├── server/
│   ├── app.js                # Configuración de Express
│   ├── index.js              # Servidor local
│   ├── config/  controllers/  routes/  middleware/  errors/
│   ├── services/             # Recursos y agente de planes
│   ├── tools/                # Herramientas que usa la IA
│   ├── gateways/             # Conexión con Groq
│   ├── repositories/         # Lectura de los JSON
│   ├── validators/           # Validación del plan
│   └── data/                 # resources.json, support-channels.json
├── tests/                    # Pruebas con node --test
├── .env.example
├── index.html
├── package.json
└── vercel.json
```

## 💻 Cómo ejecutarlo en tu computador

**Requisitos:** [Node.js 22](https://nodejs.org) y Git.

```bash
git clone https://github.com/DavidGarzon9580/Mente-Universitaria.git
cd Mente-Universitaria
npm install
```

Crea el archivo `.env` a partir del ejemplo:

```bash
# Windows (PowerShell)
copy .env.example .env
# macOS / Linux
cp .env.example .env
```

Abre `.env` y pega tu clave de Groq en `GROQ_API_KEY` (se crea gratis en [console.groq.com/keys](https://console.groq.com/keys)). Sin clave, todo funciona excepto el generador con IA.

```bash
npm run dev
```

Abre <http://localhost:3000>.

> [!CAUTION]
> El archivo `.env` está en `.gitignore`. **Nunca lo subas a GitHub ni compartas tu clave.** Si se expone, revócala en Groq y crea una nueva.

### Variables de entorno

| Variable | Obligatoria | Valor por defecto | Descripción |
|---|---|---|---|
| `GROQ_API_KEY` | Solo para la IA | — | Clave de la API de Groq. |
| `GROQ_MODEL` | No | `openai/gpt-oss-20b` | Modelo de Groq. |
| `GROQ_TIMEOUT_MS` | No | `30000` | Tiempo máximo de espera de la IA (ms). |
| `PORT` | No | `3000` | Puerto del servidor local. |
| `NODE_ENV` | No | `development` | Entorno de ejecución. |

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Compila el JS y arranca el servidor con recarga automática. |
| `npm start` | Arranca el servidor. |
| `npm run build:js` | Genera `js/app.bundle.js`. |
| `npm run build:vercel` | Compila y copia el sitio a `public/` para Vercel. |
| `npm test` | Ejecuta las pruebas. |
| `npm run check` | Revisa CSS, sintaxis, estructura HTML y contraste. |

> [!TIP]
> Si cambias algo en `js/`, ejecuta `npm run build:js` antes de hacer commit: el navegador carga `js/app.bundle.js`.

## 🚀 Despliegue en Vercel

El proyecto ya incluye `vercel.json`: las páginas se publican como archivos estáticos desde `public/` y la API corre como función en `api/index.js`.

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Deja **Framework Preset** en *Other* y no cambies el Build Command ni el Output Directory (los toma de `vercel.json`).
3. En **Settings → Environment Variables** agrega `GROQ_API_KEY` (y, si quieres, `GROQ_MODEL`).
4. Despliega. Cada `git push` a `main` vuelve a desplegar automáticamente.

Si agregas la variable después del primer despliegue, haz **Redeploy** para que se aplique.

## 🔌 API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor e indica si la IA está configurada. |
| `GET` | `/api/resources` | Catálogo. Filtros: `category`, `energy`, `maxDuration`, `search`. |
| `GET` | `/api/support-channels` | Canales de apoyo. |
| `POST` | `/api/plans/recommendation` | Genera un plan con IA (máx. 5 solicitudes por minuto). |

Ejemplo de cuerpo para `POST /api/plans/recommendation`:

```json
{
  "title": "Semana de parciales",
  "objective": "concentracion",
  "duration": 15,
  "energy": "media",
  "days": ["lunes", "miercoles", "viernes"],
  "notes": "Tengo parciales el jueves"
}
```

## ✅ Pruebas y verificaciones

```bash
npm test        # validación, catálogo, agente de IA, gateway de Groq e integración
npm run check   # CSS, paquete JS sincronizado, HTML semántico, ARIA y contraste
```

Las pruebas no llaman a Groq: usan respuestas simuladas, así que funcionan sin clave.

## 🎨 Diseño UI/UX

El diseño se trabajó en Figma con énfasis en claridad visual, navegación sencilla, diseño responsivo, accesibilidad, jerarquía visual, consistencia entre vistas y baja carga cognitiva.

## 📚 Referencias

- Organización de las Naciones Unidas. (2015). *Objetivo 3: Garantizar una vida sana y promover el bienestar para todos en todas las edades*. Objetivos de Desarrollo Sostenible. <https://www.un.org/sustainabledevelopment/es/health/>
- World Wide Web Consortium (W3C). (2023). *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation. <https://www.w3.org/TR/WCAG21/>
- *Revista de Salud Pública*, 10(5), 831–839. (2008). <https://doi.org/10.1590/S0124-00642008000500015>

## 📄 Estado del proyecto

Proyecto académico independiente, en desarrollo. Las funcionalidades, contenidos, canales de apoyo e integraciones pueden cambiar durante el desarrollo y las pruebas.
