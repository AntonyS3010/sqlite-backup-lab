# Backup Lab: estrategias de backup con SQLite

Demostración educativa en español con datos ficticios. Sin MS SQL Server, contraseñas ni servicios de pago. Incluye una aplicación pública estática y un laboratorio reproducible en Python.

## Enlaces verificados

- [Aplicación](https://antonys3010.github.io/sqlite-backup-lab/)
- [Artículo en Dev.to](https://dev.to/antonys3010/un-backup-sirve-cuando-puedes-restaurarlo-laboratorio-con-sqlite-y-github-actions-3i4p)
- [Pruebas y despliegue exitosos](https://github.com/AntonyS3010/sqlite-backup-lab/actions/runs/37151388887)
- [Artículo correspondiente a Adriana](https://dev.to/antonys3010/como-saber-si-tu-backup-funciona-integridad-y-recuperacion-con-sqlite-adriana-laos-55gp)
- Video (3:48): PENDIENTE DE PUBLICACIÓN — MP4 local preparado y verificado, duración 3:48.

## Ejecutar

Requiere Python 3.9 o superior, sin paquetes adicionales:

```sh
python3 backup_demo.py
python3 backup_demo.py --output lab-results
python3 -m http.server 8000 --directory site
```

El primer comando crea un laboratorio temporal. El segundo guarda la base sintética, copia física, dump SQL, SHA-256 e informe en un directorio nuevo; no sobrescribe carpetas existentes. El tercero sirve la aplicación en http://localhost:8000. La aplicación descarga SQLite WebAssembly desde jsDelivr, versión fijada 1.13.0. Solo se usan registros ficticios; no subir bases reales.

## Demostración web

1. Crear una copia completa de tres registros.
2. Añadir un registro después del backup para observar la pérdida de cambios posteriores (RPO).
3. Simular la pérdida; solo se borra el inventario desechable en memoria.
4. Restaurar: se comprueban SHA-256, `PRAGMA integrity_check` e igualdad de registros.
5. Descargar la copia `.sqlite` para abrirla con SQLite. La página no importa archivos externos.

La base y copia viven en memoria y desaparecen al recargar. La app publicada no es un servidor de bases de datos: SQLite se ejecuta en el navegador de cada visitante. GitHub Pages aloja los archivos públicos. El laboratorio Python usa `Connection.backup()` y prueba también una restauración desde `iterdump()`.

## Despliegue automatizado

Crear un repositorio **público** llamado `sqlite-backup-lab` y subir estos archivos en la rama `main`, incluida `.github/workflows/pages.yml`. En Settings → Pages → Build and deployment seleccionar **GitHub Actions**. Cada push a main prueba la recuperación antes de publicar `site/`; también puede iniciarse con Run workflow. No necesita PAT ni secretos personalizados: utiliza el token temporal de Actions con permisos limitados por tarea.

La configuración está preparada; considerar publicado solo cuando Actions termine correctamente y la URL real responda. No confundir GitHub Pages con un servicio de backups remotos.

## Límites y estrategia operativa

- Copia completa física y dump lógico; no implementa backups incrementales, diferenciales ni PITR.
- La copia en la misma memoria no cumple 3-2-1. Para un caso real hacen falta destinos independientes, copia externa y restauraciones periódicas.
- SHA-256 detecta cambios si el hash de referencia es confiable; no cifra ni autentica una copia ante un atacante que pueda sustituir ambos.
- `integrity_check` revisa estructura; comparar registros verifica este caso concreto. No sustituye controles funcionales de una aplicación real.
- El tiempo medido corresponde a tres registros locales, no a un RTO garantizado.
- No copiar a ciegas un archivo SQLite activo: usar la API de backup o `VACUUM INTO`, especialmente con escrituras y WAL.

## Materiales

- `docs/articulo.md`: artículo para Dev.to, Medium o Hashnode.
- `docs/video.md`: guion y tomas para un video de 4 minutos y 30 segundos.
- `docs/publicacion.md`: pasos pendientes y comprobación de enlaces.

## Fuentes oficiales

- https://www.sqlite.org/backup.html
- https://www.sqlite.org/lang_vacuum.html
- https://docs.python.org/3/library/sqlite3.html
- https://sql.js.org/documentation/Database.html
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

Licencia MIT. Los ejemplos son propios y usan únicamente datos sintéticos.
