🧠 Mente Universitaria
Plataforma web de autocuidado, organización y bienestar estudiantil
Mente Universitaria es una plataforma web orientada a estudiantes universitarios, diseñada para facilitar el autocuidado cotidiano, la organización personal y el acceso a recursos relacionados con el bienestar.

El proyecto está desarrollado como una iniciativa académica independiente dirigida principalmente a estudiantes de la Corporación Universitaria Minuto de Dios (UNIMINUTO).

⚠️ Importante: Mente Universitaria no es una plataforma oficial de UNIMINUTO y no sustituye la atención profesional en salud mental.

📌 Índice
Descripción del proyecto
Alcance
Deslinde de responsabilidad
Planteamiento del problema
Justificación
Objetivos
Alineación con los ODS
Funcionalidades
Integración de Inteligencia Artificial
Accesibilidad
Tecnologías utilizadas
Arquitectura y almacenamiento
Estructura del proyecto
Diseño UI/UX
Repositorio
Referencias bibliográficas
🎯 Descripción del proyecto
Los estudiantes universitarios pueden enfrentarse diariamente a diferentes factores que afectan su bienestar, como la carga académica, responsabilidades laborales, compromisos personales, dificultades de organización y períodos prolongados de estrés.

Mente Universitaria busca proporcionar un espacio digital accesible donde el estudiante pueda encontrar recursos educativos, realizar actividades breves de autocuidado, evaluar de manera orientativa su estado de bienestar y construir un plan personal de hábitos.

La plataforma adopta un enfoque preventivo y educativo, sin realizar diagnósticos médicos o psicológicos.

🎯 Alcance
El proyecto está dirigido principalmente a estudiantes de la Corporación Universitaria Minuto de Dios (UNIMINUTO) y se desarrolla dentro de un contexto académico independiente.

La plataforma contempla herramientas para:

Consultar recursos educativos relacionados con bienestar y autocuidado.
Realizar pausas activas y ejercicios breves.
Completar una encuesta de bienestar de carácter orientativo.
Crear un plan personal de actividades.
Generar propuestas personalizadas mediante Inteligencia Artificial.
Consultar información sobre canales de apoyo y orientación.
⚠️ Deslinde de responsabilidad
Mente Universitaria:

No constituye una plataforma oficial ni un canal institucional formal de UNIMINUTO.
No diagnostica condiciones de salud mental.
No emite conceptos clínicos.
No reemplaza la atención, orientación, acompañamiento o terapia de profesionales de la salud.
La información proporcionada tiene fines educativos, preventivos y de autocuidado.
En situaciones que requieran atención profesional o de emergencia, se recomienda acudir a los canales institucionales o servicios de emergencia correspondientes.
❓ Planteamiento del problema
Los estudiantes universitarios enfrentan de forma recurrente cargas académicas, laborales y personales que pueden influir en su bienestar emocional y en su capacidad de organización.

Aunque existen recomendaciones, recursos educativos y servicios de apoyo, los estudiantes pueden tener dificultades para encontrar en un mismo espacio una herramienta digital que les permita:

Organizar actividades personales de autocuidado.
Incorporar pausas activas durante su jornada.
Consultar información relacionada con bienestar.
Realizar un seguimiento personal de sus hábitos.
Construir una rutina adaptada a su disponibilidad.
Pregunta central
¿Cómo diseñar e implementar una plataforma web accesible que facilite a los estudiantes de UNIMINUTO la consulta de recursos de bienestar, la realización de actividades de autocuidado y la organización de un plan personal?

💡 Justificación
El desarrollo de Mente Universitaria busca ofrecer una alternativa digital práctica, preventiva e intuitiva que facilite la incorporación de hábitos de autocuidado y organización personal dentro de la rutina académica.

Desde una perspectiva técnica y pedagógica, el proyecto permite aplicar conceptos fundamentales del desarrollo web moderno, entre ellos:

HTML5 semántico: organización estructurada, lógica y accesible del contenido.
CSS nativo: diseño responsivo, variables CSS, personalización visual y adaptación a diferentes dispositivos.
JavaScript: interacción dinámica, navegación SPA, validación de formularios y manipulación del contenido.
Node.js y Express: desarrollo del backend y gestión de solicitudes.
IndexedDB: almacenamiento local y persistente de información.
Integración de Inteligencia Artificial: generación asistida de propuestas personalizadas.
Accesibilidad web: aplicación de principios y recomendaciones de W3C/WCAG.
🎯 Objetivos
Objetivo general
Desarrollar una plataforma web accesible y responsiva para estudiantes de UNIMINUTO que integre recursos educativos, actividades de autocuidado, una encuesta de bienestar y un generador de planes asistido por Inteligencia Artificial.

Objetivos específicos
Diseñar la interfaz de usuario (UI/UX) y la arquitectura accesible de la plataforma aplicando criterios de diseño responsivo y pautas W3C/WCAG.
Construir los módulos funcionales de recursos, pausas activas, encuesta de bienestar y generación de planes.
Implementar las funcionalidades utilizando tecnologías web estándar como HTML5, CSS, JavaScript, Node.js y Express.
Integrar la API de OpenAI desde un backend propio para generar propuestas personalizadas.
Implementar almacenamiento local mediante IndexedDB para conservar los planes creados por el usuario.
Incorporar herramientas de accesibilidad que permitan adaptar la experiencia visual y de navegación.
🌎 Alineación con los Objetivos de Desarrollo Sostenible
El proyecto se relaciona principalmente con el:

ODS 3 — Salud y Bienestar
Garantizar una vida sana y promover el bienestar para todos en todas las edades.

Mente Universitaria contribuye desde un enfoque educativo y preventivo mediante herramientas digitales orientadas al autocuidado, la organización personal y la promoción del bienestar cotidiano.

🖥️ Funcionalidades
La plataforma está organizada en seis páginas o vistas principales:

Vista	Descripción
🏠 Inicio	Presentación de la plataforma, propósito y acceso rápido a sus principales funcionalidades.
📋 Encuesta de bienestar	Autoevaluación interactiva de carácter orientativo.
📚 Recursos	Catálogo de contenidos educativos, artículos y guías prácticas.
🧘 Mi pausa	Espacio guiado para realizar pausas activas y ejercicios breves de relajación.
📅 Mi plan	Herramienta para configurar, generar y guardar un plan personal de bienestar.
🆘 Buscar apoyo	Información sobre canales de orientación y servicios de apoyo.

🤖 Integración de Inteligencia Artificial
La Inteligencia Artificial no funcionará como una séptima página ni como un chatbot independiente.

La funcionalidad estará integrada directamente dentro de la sección Mi plan.

Flujo general
Usuario
   │
   ▼
Formulario "Mi plan"
   │
   │ Objetivo
   │ Tiempo disponible
   │ Nivel de energía
   │ Días a programar
   ▼
Frontend
   │
   │ Fetch API
   ▼
Backend Node.js + Express
   │
   ├── Consulta catálogo de actividades
   │
   └── Solicitud a API de OpenAI
   │
   ▼
Propuesta estructurada
   │
   ▼
Frontend
   │
   ▼
Usuario revisa y decide
   │
   └──► Guardar en IndexedDB

Proceso
El estudiante ingresa sus parámetros iniciales:

Objetivo personal.
Tiempo disponible.
Nivel de energía.
Días que desea programar.
El frontend envía la información de forma asíncrona al backend mediante Fetch API.

El backend desarrollado con Node.js + Express procesa la solicitud.

El servidor consulta el catálogo de actividades disponible y realiza la solicitud correspondiente a la API de OpenAI.

La Inteligencia Artificial genera una propuesta estructurada de plan.

El estudiante revisa la propuesta.

El estudiante decide voluntariamente si desea guardar el plan.

En caso de aceptarlo, la información se almacena localmente mediante IndexedDB.

🔐 La API Key de OpenAI debe permanecer exclusivamente en el servidor y almacenarse mediante variables de entorno. Nunca debe incluirse directamente en el JavaScript ejecutado en el navegador.

🆘 Buscar apoyo
La sección Buscar apoyo tiene una función exclusivamente informativa y de derivación responsable.

Contemplará información como:

Canales institucionales de orientación de UNIMINUTO.
Información sobre servicios de orientación psicológica.
Líneas de atención disponibles según la ubicación.
Números de emergencia nacionales y locales.
Recursos de apoyo en situaciones que requieran atención profesional.
Nota: Los números y canales de atención deben verificarse y mantenerse actualizados antes de publicar la plataforma.

♿ Accesibilidad
La accesibilidad constituye uno de los componentes principales del proyecto.

Personalización visual
La plataforma contempla:

☀️ Modo claro
🌙 Modo oscuro
◼️ Modo alto contraste
🔤 Ajuste del tamaño de fuente.
🔄 Botón para restablecer las configuraciones.
Escala de tipografía
Se contemplan los siguientes porcentajes:

85% · 90% · 95% · 100% · 125% · 150% · 200%

Navegación
La plataforma contempla:

Navegación mediante teclado.
Estados de foco visibles mediante :focus-visible.
Migas de pan en las vistas internas.
Pie de página persistente.
Enlaces directos a las seis secciones principales.
Estructura HTML5 semántica.
Contraste adecuado entre elementos visuales.
Diseño adaptable a diferentes tamaños de pantalla.
📝 Formularios y validación
El formulario principal estará ubicado en la sección Mi plan.

La validación se realizará en dos niveles:

Frontend
JavaScript será responsable de:

Verificar campos obligatorios.
Validar tipos de datos.
Comprobar rangos permitidos.
Mostrar mensajes de error comprensibles.
Evitar el envío de información incompleta.
Backend
Las mismas reglas de validación deberán implementarse en Node.js/Express.

Esto permite que el servidor no dependa exclusivamente de las validaciones realizadas en el navegador y evita aceptar datos inconsistentes o manipulados.

Las expresiones regulares se utilizarán únicamente cuando sean apropiadas para validar formatos concretos; no deben considerarse un mecanismo de seguridad por sí mismas.

🛠️ Tecnologías utilizadas
Tecnología	Uso
HTML5	Estructura semántica y accesible del contenido.
CSS3 / CSS nativo	Estilos, variables, temas, responsividad y personalización visual.
JavaScript	Lógica de la aplicación, interacción, formularios y renderizado dinámico.
Fetch API	Comunicación asíncrona entre frontend y backend.
Node.js	Entorno de ejecución del backend.
Express	Framework para la creación de la API y gestión de solicitudes HTTP.
IndexedDB	Almacenamiento local y persistente de los planes del usuario.
OpenAI API	Generación asistida de propuestas personalizadas.
Git	Control de versiones.
GitHub	Repositorio y colaboración.
Figma	Diseño y prototipado UI/UX.

🗄️ Arquitectura y almacenamiento
La aplicación utiliza una arquitectura cliente-servidor:

┌───────────────────────────────┐
│          FRONTEND             │
│                               │
│ HTML5 + CSS + JavaScript      │
│                               │
│ - Interfaz                    │
│ - Formularios                 │
│ - Accesibilidad               │
│ - Encuesta                    │
│ - Mi plan                     │
└───────────────┬───────────────┘
                │
           Fetch API
                │
                ▼
┌───────────────────────────────┐
│           BACKEND             │
│                               │
│ Node.js + Express             │
│                               │
│ - Validación                  │
│ - Procesamiento               │
│ - Catálogo de actividades     │
│ - Integración con OpenAI      │
└───────────────┬───────────────┘
                │
                ▼
        ┌───────────────┐
        │  OpenAI API   │
        └───────────────┘


┌───────────────────────────────┐
│          NAVEGADOR            │
│                               │
│          IndexedDB            │
│                               │
│  Plan personal del usuario    │
└───────────────────────────────┘

Persistencia local
Los planes personalizados se almacenarán localmente en el navegador mediante IndexedDB.

Esto permite conservar la información sin necesidad de crear una cuenta o almacenar los planes personales en una base de datos externa.

Seguridad
Las solicitudes relacionadas con Inteligencia Artificial requieren conexión a Internet.

La clave de acceso a la API deberá almacenarse en una variable de entorno del backend:

OPENAI_API_KEY=tu_clave_aqui

El archivo .env no debe subirse al repositorio.

Se recomienda incluirlo en .gitignore:

.env
node_modules/

📁 Estructura del proyecto
mente-universitaria/
│
├── assets/
│   ├── audio/
│   │   └── .gitkeep
│   │
│   ├── img/
│   │   ├── buscar-apoyo.png
│   │   ├── hoja.png
│   │   ├── inicio-estudiantes.png
│   │   ├── portada-recursos.png
│   │   ├── recurso-descanso.png
│   │   ├── recurso-destacado.png
│   │   ├── recurso-organizacion.png
│   │   └── recurso-presion.png
│   │
│   └── videos/
│       └── .gitkeep
│
├── css/
│   └── .gitkeep
│
├── js/
│   └── .gitkeep
│
├── pages/
│   ├── buscar-apoyo.html
│   ├── encuesta.html
│   ├── mi-pausa.html
│   ├── mi-plan.html
│   └── recursos.html
│
├── index.html
├── .gitignore
├── package.json
└── README.md

🎨 Diseño UI/UX
El diseño y prototipado de la plataforma se desarrollan utilizando Figma, con énfasis en:

Claridad visual.
Navegación sencilla.
Diseño responsivo.
Accesibilidad.
Jerarquía visual.
Consistencia entre las diferentes vistas.
Reducción de la carga cognitiva durante la navegación.
Prototipo
Ver prototipo en Figma

🔗 Repositorio
El código fuente del proyecto se encuentra disponible en GitHub:

Repositorio de Mente Universitaria en GitHub

📚 Referencias bibliográficas
Organización de las Naciones Unidas. (2015). Objetivo 3: Garantizar una vida sana y promover el bienestar para todos en todas las edades. Objetivos de Desarrollo Sostenible.
Objetivo 3 — Naciones Unidas

World Wide Web Consortium (W3C). (2023). Web Content Accessibility Guidelines (WCAG) 2.1. W3C Recommendation.
WCAG 2.1 — W3C

Revista de Salud Pública, 10(5), 831–839.
https://doi.org/10.1590/S0124-00642008000500015

📄 Estado del proyecto
Proyecto académico independiente — En desarrollo.

Las funcionalidades, contenidos, canales de apoyo e integraciones externas pueden estar sujetos a cambios durante el desarrollo y las pruebas de la plataforma.

