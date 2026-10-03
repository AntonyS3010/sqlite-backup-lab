---
title: 'Un backup sirve cuando puedes restaurarlo: laboratorio con SQLite y GitHub Actions'
published: false
tags: sqlite, database, beginners, devops
description: 'Copia completa, pérdida simulada y recuperación verificada con SQLite, Python y una demo web.'
---

# Un backup sirve cuando puedes restaurarlo: laboratorio con SQLite y GitHub Actions

Una carpeta llena de copias no demuestra que una aplicación pueda recuperarse. Para comprobarlo, necesitamos provocar una pérdida controlada, restaurar una copia y verificar que los datos recuperados sean los esperados.

Este proyecto usa SQLite y un inventario ficticio de cuadernos, lapiceros y mochilas. No utiliza Microsoft SQL Server. Tiene dos partes: una aplicación educativa que ejecuta SQLite en el navegador y un laboratorio de Python que prueba copias físicas y lógicas.

## Primero, definir qué significa recuperarse

Antes de elegir una herramienta, fijaría dos objetivos. El **RPO** expresa cuántos cambios podemos permitirnos perder. Si guardo una copia y después ingreso una venta, restaurar esa copia no recuperará la venta posterior. El **RTO** expresa cuánto tiempo podemos permitir que dure la recuperación; incluye más que leer un archivo: también localizarlo, preparar el entorno y comprobar la aplicación.

En la demostración, estos conceptos se observan con pocos registros. El tiempo local que muestra la página es una medición del ejercicio, no una promesa para una base de producción.

## Elegir la estrategia de copia

Una copia completa conserva un estado íntegro y simplifica la recuperación. Su coste aumenta con el volumen de datos. Una copia incremental guarda cambios desde la copia anterior y exige reconstruir la cadena; una diferencial guarda cambios desde la última completa. Este laboratorio implementa copias completas, no esas dos estrategias.

También conviene distinguir formato físico y lógico. En Python creo una base SQLite independiente mediante `Connection.backup()` y genero un dump SQL mediante `iterdump()`. El dump permite reconstruir esquema y registros, pero no equivale a conservar todos los detalles físicos del archivo. Ambas operaciones están documentadas en la [biblioteca sqlite3 de Python](https://docs.python.org/3/library/sqlite3.html).

Para una base activa, copiar el archivo sin coordinar las escrituras puede producir una copia incorrecta o incompleta. SQLite ofrece su [Online Backup API](https://www.sqlite.org/backup.html), y [`VACUUM INTO`](https://www.sqlite.org/lang_vacuum.html) permite generar otra base. En particular, con WAL no debe asumirse que el archivo principal contiene todos los cambios confirmados. Aquí uso la API, en vez de una copia arbitraria del archivo.

## Construir el ejercicio reproducible

El laboratorio `backup_demo.py` funciona sin dependencias externas:

```sh
python3 backup_demo.py --output lab-results
```

El directorio de salida debe ser nuevo, para evitar sobrescribir otros archivos. El programa crea tres productos ficticios, obtiene una copia, calcula SHA-256 y genera un dump. Después vacía únicamente el inventario del laboratorio y restaura la copia.

La operación central es:

```python
with sqlite3.connect(target) as snapshot:
    live.backup(snapshot)
```

La recuperación invierte origen y destino. Antes de reemplazar el contenido, compruebo la copia; después comparo los registros restaurados con los originales. También reconstruyo otra base en memoria a partir del dump SQL. El informe registra filas iniciales, filas tras el incidente, filas restauradas y resultados de verificación.

## Una demostración que cualquiera puede probar

La aplicación usa sql.js, que permite exportar los bytes de una base SQLite y construir otra a partir de ellos; estas funciones aparecen en su [documentación de Database](https://sql.js.org/documentation/Database.html).

El recorrido es sencillo: crear copia, añadir un registro nuevo, simular la pérdida y restaurar. La recuperación devuelve el estado guardado y deja fuera el registro posterior. Esto permite observar la pérdida de cambios sin tocar información real.

La copia puede descargarse como `.sqlite`. Tanto la base activa como la copia interna viven en memoria: recargar la pestaña las elimina. GitHub Pages aloja la interfaz pública; no aloja un servidor SQLite compartido ni protege las copias de los visitantes.

## Automatizar la publicación

El repositorio incluye un flujo de GitHub Actions. Cada cambio en `main` ejecuta el laboratorio; solo si la recuperación pasa, sube y despliega los archivos de `site/` en Pages. Para habilitarlo se selecciona GitHub Actions como origen de publicación en los ajustes del repositorio. Este patrón utiliza las [acciones oficiales de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

El flujo no necesita contraseñas de base de datos ni un token personal almacenado en el código. Usa los permisos temporales de Actions para publicar. El despliegue de la aplicación es automático; la copia del navegador se crea al pulsar el botón. No son la misma automatización.

## Verificar y guardar fuera del dispositivo

Uso tres comprobaciones complementarias: SHA-256 para detectar cambios respecto de un hash confiable, `PRAGMA integrity_check` para comprobar la estructura y comparación de registros para validar el resultado del ejercicio. Un hash no cifra el archivo y no impide que un atacante sustituya archivo y hash juntos.

Para llevarlo a un entorno real propondría tres copias, almacenamiento en medios o sistemas independientes y al menos una ubicación externa; además, permisos restringidos, cifrado y pruebas periódicas. La copia del laboratorio, en el mismo equipo, no cumple esa estrategia. También establecería una retención concreta según el RPO: por ejemplo, copias diarias durante siete días y semanales durante cuatro semanas, ajustada al caso real. El proyecto no implementa esa retención ni recuperación a un instante mediante logs.

## Conclusión

La evidencia útil de este ejercicio es recuperar el inventario y comprobarlo. Crear una copia es el inicio; poder localizarla, restaurarla y confiar en su contenido es el resultado que buscamos.

Los enlaces de repositorio, aplicación y video deben incorporarse aquí después de verificar sus publicaciones. Esta versión no afirma que ya estén publicadas.
