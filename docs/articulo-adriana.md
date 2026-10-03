# Cómo saber si tu backup funciona: integridad y recuperación con SQLite — Adriana Laos

**Artículo del equipo — integrante: Adriana Rafaela Laos Gonzales.** Publicado desde la cuenta del equipo administrada por Antony.

Guardar un archivo y llamarlo «backup» no demuestra que los datos estén recuperables. Podemos conservar una copia incompleta, perder los cambios posteriores a ella o descubrir demasiado tarde que nadie conoce el procedimiento de restauración. En este artículo me centro en cómo comprobar la recuperación, usando un laboratorio con SQLite y registros ficticios.

## El proyecto que vamos a comprobar

El equipo construyó una pequeña aplicación de inventario. Usa SQLite en el navegador mediante sql.js y un laboratorio independiente en Python. No utiliza Microsoft SQL Server.

- [Código público](https://github.com/AntonyS3010/sqlite-backup-lab).
- [Aplicación desplegada](https://antonys3010.github.io/sqlite-backup-lab/).
- [Automatización y pruebas](https://github.com/AntonyS3010/sqlite-backup-lab/actions).

La página funciona con datos de prueba y no requiere iniciar sesión. GitHub Pages publica la interfaz; la base se ejecuta en la memoria del navegador de cada visitante. Una recarga elimina el estado, de modo que no debe confundirse esta demostración con almacenamiento persistente en la nube.

## Tres preguntas distintas para una misma copia

Antes de restaurar, conviene distinguir tres comprobaciones:

| Pregunta | Comprobación del laboratorio | Qué no garantiza |
|---|---|---|
| ¿Cambió el archivo respecto del original? | SHA-256 | No cifra ni autentica si un atacante puede reemplazar también el hash. |
| ¿La estructura de SQLite está íntegra? | `PRAGMA integrity_check` | No prueba por sí sola que los registros esperados estén presentes. |
| ¿Recuperamos el contenido previsto? | Comparar inventario ordenado por ID | Solo valida los datos y reglas que realmente se comprobaron. |

Son pruebas complementarias. Una base puede ser estructuralmente válida y estar vacía; también puede contener información desactualizada. Por eso la [comprobación de integridad de SQLite](https://www.sqlite.org/pragma.html#pragma_integrity_check) forma parte del procedimiento, pero no es su único criterio de éxito.

## Un experimento para entender el RPO

El RPO expresa la pérdida de datos tolerable, normalmente en tiempo. La demo permite observar el efecto de guardar un estado anterior:

1. Abrir la aplicación: hay tres productos.
2. Pulsar «Crear copia completa».
3. Añadir un cuarto registro después de la copia.
4. Pulsar «Simular pérdida de datos»; el inventario queda vacío.
5. Restaurar y verificar.

La recuperación devuelve los tres productos originales. El cuarto no vuelve porque fue creado después del backup. No es un error de restauración: la copia contiene un estado anterior. Esta diferencia permite entender por qué la frecuencia de backups debe responder a una necesidad concreta.

Si una operación no tolera perder muchas transacciones, una copia completa ocasional puede ser insuficiente. Harían falta una frecuencia adecuada y, según el motor, otras estrategias de recuperación. Este proyecto no implementa backups incrementales, diferenciales ni recuperación a un instante específico.

## Recuperar de forma segura

En la aplicación, primero se comprueba la copia y se construye una base candidata. Se verifica su integridad y se comparan sus registros con los guardados. Solo entonces se sustituye la base activa. Así, un fallo en la comprobación no reemplaza directamente los datos existentes.

La API de sql.js permite obtener los bytes SQLite con `export()` y crear una base con `new SQL.Database(bytes)`, como indica su [documentación](https://sql.js.org/documentation/Database.html). Esta copia se conserva en memoria y puede descargarse como `.sqlite`.

Para trabajar con una base SQLite activa fuera del navegador, no conviene copiar a ciegas el archivo principal. La [API oficial de backup de SQLite](https://www.sqlite.org/backup.html) proporciona una forma de generar una copia consistente. En el laboratorio Python se usa `Connection.backup()`. También se genera un dump con `iterdump()` y se restaura en una base independiente, según la [documentación de Python](https://docs.python.org/3/library/sqlite3.html).

## El RTO va más allá del cronómetro

La página muestra el tiempo local de restauración de una base mínima. Ese número sirve para observar la operación, pero no estima la recuperación de un sistema real.

Un objetivo de RTO debe considerar localizar la copia, descargarla si está fuera del equipo, reconstruir el entorno, restaurar permisos y dependencias, ejecutar comprobaciones y confirmar que la aplicación vuelve a funcionar. Tres registros en memoria no representan una base grande ni una caída de infraestructura.

## Qué automatizamos y qué debemos practicar

El repositorio contiene un flujo de GitHub Actions que se ejecuta cuando cambia la rama `main`. Primero prueba el ciclo de pérdida y recuperación en Python; si pasa, publica la aplicación en Pages. La configuración utiliza las [acciones de despliegue oficiales](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Esta automatización evita desplegar si falla la prueba incluida. No programa backups de una base de producción: las copias del navegador son manuales y el laboratorio usa datos generados para cada ejecución.

Además de automatizar, mantendría un procedimiento breve de restauración: identificar la copia y su fecha, validar su referencia, recuperar en un entorno controlado, comprobar datos y registrar el resultado. Practicar ese procedimiento permite detectar problemas antes de una emergencia.

## Guardar una copia donde el incidente no llegue

La copia de esta demo está en el mismo dispositivo que la base. Si se pierde el equipo o se cierra la pestaña sin descargarla, también podemos perderla. Para un uso real propondría copias independientes, al menos una ubicación externa, retención definida, acceso restringido y cifrado. Una copia descargada en el mismo disco tampoco basta ante el fallo de ese disco.

La estrategia debe evaluarse por su capacidad de recuperación. El ejercicio deja una evidencia concreta: podemos perder el inventario, reconstruir el estado guardado y comprobarlo, comprendiendo qué cambios quedan fuera.

**Video del equipo:** PENDIENTE DE PUBLICACIÓN — MP4 local preparado y verificado, duración 3:48.

*Texto preparado con asistencia de IA para el artículo correspondiente a esta integrante. Las pruebas del proyecto fueron ejecutadas localmente, en GitHub Actions y en la aplicación pública por el asistente del equipo.*
