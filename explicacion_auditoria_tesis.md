# Justificación de Configuración: Auditorías con Unlighthouse

Para asegurar que los resultados obtenidos en el análisis de rendimiento de nuestra propuesta frente a los portales de la competencia fuesen representativos y consistentes, el cálculo métrico se ha llevado a cabo haciendo uso de la herramienta **Unlighthouse** parametrizada expresamente para este escenario. A continuación, se detallan y justifican las decisiones técnicas relativas a la configuración del escáner en el repositorio de la aplicación:

### Configuración de los parámetros

Se definió el módulo `unlighthouse.config.ts`, cuyo cometido es dictar las normas y límites de rastreo y de toma de muestras del "crawler" automatizado mientras evalúa las aplicaciones correspondientes:

- **Muestras promedio (`samples: 3`)**: Como decisión técnica más relevante, dada la enorme volatilidad de las métricas web debidas a factores externos (congestión de red, tiempos fluctuantes en los servidores de las administraciones, carga de scripts de terceros, etc.), se ha configurado el escáner para que la ejecución se realice un mínimo de **tres veces sobre cada ruta explorada**. Unlighthouse se encarga automáticamente de procesar dichas iteraciones para elaborar un promedio, dotando al resultado de una rigurosidad estadística mucho más madura para un Trabajo de Fin de Grado.

- **Límite de rutas (`maxRoutes: 10`)**: Portales como los del consistorio de Zaragoza u otras diputaciones albergan miles de páginas anexas en sus dominios principales, lo que podría desbordar la auditoría dilatándose en el tiempo y entorpeciendo los servidores públicos por el volumen de tráfico sintético. Se delimita la exploración a las páginas más inmediatas desde la página de inicio en un número máximo representativo para obtener un muestreo sin abrumar la administración analizada.

- **Dispositivo emulado (`device: 'desktop'`)**: Si bien la optimización adaptativa o _Mobile First_ resulta vital en el panorama actual, un sector significativo de los sistemas de reserva e infraestructura para ayuntamientos y operarios suele gestionarse intrínsecamente desde terminales y entornos de escritorio por parte del funcionariado y organizadores profesionales. Por este motivo, el rendimiento en esta resolución es el estándar a comparar frente al resto.

- **Aislamiento en Chromium (`customCmdFlags`)**: Se adicionan flags y argumentos subyacentes (`--no-sandbox` y `--disable-setuid-sandbox`) en la capa de Chromium automatizada. El objetivo es solventar y eludir barreras preventivas (_headless bot mitigations_) habituales frente a extractores de datos o _DDoS_ que pudiesen presentar administraciones, asegurando que la recolección rinda sus métricas sin falsos abandonos en la capa de red provocados por WAFs (Web Application Firewalls).

Con este escenario de base establecido, el estudio comparativo se ha orquestado mediante un proceso local por lotes (a través de un \textit{script} en Node.js, `auditorias.js`). Este fluyo de trabajo no solo ejecuta secuencialmente la auditoría sobre todas las infraestructuras web, sino que incluye un módulo propio de consolidación de datos. 

### Generación Automática del Índice Global (Offline)

Una vez completadas todas las iteraciones de Lighthouse descritas, los volcados interactivos generados por defecto imponen una lectura servida bajo un protocolo HTTP que suele conllevar complicaciones y problemas de *CORS* (Cross-Origin Resource Sharing) si se abren directamente desde el sistema de archivos local.

Para suplir esta dependencia técnica y facilitar la revisión de los datos recabados en la presente memoria, el *script* orquestador ha sido vitaminado con un proceso final de generación de reportes fijos. Dicho módulo navega las salidas en disco generadas por *Unlighthouse*, interpreta y extrae los resultados paramétricos anidados en las respuestas JSON crudas (`ci-result.json`) de cada portal evaluado, y sintetiza automáticamente un documento único estático consolidado (`indice_offline.html`). 

Este artefacto final se materializa en una vista tabular agregando las puntuaciones precisas (Rendimiento, Accesibilidad, Mejores Prácticas y SEO) para cada ruta escaneada de las distintas entidades analizadas. De esta forma, se obtiene al instante un registro portátil, objetivo y de consulta unificada prescindiendo total y absolutamente de entornos virtualizados de red o servidores temporales en el entorno local del evaluador.
