# Guion de video — duración objetivo 4:30, máximo 5:00

Título: «Backup y recuperación con SQLite: prueba real + GitHub Actions»

Grabar únicamente la ventana de la demo y el repositorio público. Cerrar pestañas privadas y ocultar notificaciones. No mostrar ajustes de credenciales. Puede publicarse sin cámara; la narración es opcional si se añaden los subtítulos indicados.

| Tiempo | Pantalla | Narración / texto en pantalla |
|---|---|---|
| 0:00–0:25 | Portada de Backup Lab | «Un backup sirve cuando podemos restaurarlo. Este proyecto usa SQLite y datos ficticios, sin SQL Server.» |
| 0:25–0:55 | README y archivos del repositorio público | «Hay una demo web y un laboratorio en Python. El código está en un repositorio público. La demo ejecuta SQLite en cada navegador.» |
| 0:55–1:25 | Aplicación con tres productos; Crear copia | «Guardo una copia completa y su SHA-256. También puedo descargar un archivo SQLite real.» |
| 1:25–1:55 | Añadir registro; mostrar cuatro filas | «Este registro se creó después del backup. Si recuperamos la copia anterior, perderemos este cambio: aquí vemos el efecto del RPO.» |
| 1:55–2:25 | Simular pérdida; tabla vacía | «El incidente vacía únicamente los datos de prueba. La copia sigue disponible.» |
| 2:25–2:55 | Restaurar; tres filas y mensaje de verificación | «La recuperación compara el hash, verifica integridad y confirma los registros guardados. El cuarto registro no estaba en la copia.» |
| 2:55–3:30 | Archivo backup_demo.py y ejecución/informe | «Python usa la API de backup de SQLite y también restaura un dump SQL. El informe muestra tres filas recuperadas e integridad correcta.» |
| 3:30–4:00 | Actions, ejecución exitosa y URL pública | «Cada push a main prueba la restauración y después despliega la aplicación en GitHub Pages. La publicación es automática y no usa tokens personales en el código.» |
| 4:00–4:30 | Sección de límites; artículo público | «La copia en el mismo equipo no cumple 3-2-1. Un caso real requiere almacenamiento independiente, permisos, cifrado, retención y pruebas. Los enlaces del artículo, proyecto y video están en la entrega.» |

## Lista de tomas

1. Aplicación: tres → copia → cuatro → pérdida → restauración de tres.
2. Comando `python3 backup_demo.py` y resultado correcto.
3. Repositorio público y flujo `Verify backups and deploy demo` exitoso.
4. URL pública cargando y artículo publicado.

No filmar una ejecución fallida como si hubiera pasado ni sustituir una URL pendiente por una inventada. Si todavía no hay despliegue, completar ese paso antes de grabar las tomas 3 y 4.

## Publicación

Descripción propuesta: «Laboratorio educativo de copias completas y restauración con SQLite. Incluye verificación SHA-256, integrity_check, comparación de registros y despliegue con GitHub Actions. Datos ficticios; no es una política de backups de producción. Enlaces: añadir los enlaces públicos verificados del repositorio, aplicación y artículo.»

Exportar a 1080p, revisar que dure menos de 5 minutos y subir con visibilidad Pública a YouTube u otra red pública. Abrir el enlace sin sesión para verificar acceso. Añadir la URL real a ENLACES.txt y regenerar el ZIP final.
