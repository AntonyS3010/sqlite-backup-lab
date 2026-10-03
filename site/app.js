'use strict';
let SQL, db, snapshot, expected, checksum;
const el = id => document.getElementById(id);
const records = database => database.exec('SELECT id, product, quantity FROM inventory ORDER BY id')[0]?.values || [];
const hash = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map(v => v.toString(16).padStart(2,'0')).join('');
function integrity(database) {
  if (JSON.stringify(database.exec('PRAGMA integrity_check')[0]?.values) !== '[["ok"]]') throw new Error('La comprobación de integridad falló.');
}
function render() {
  const data = records(db);
  el('count').textContent = data.length;
  el('rows').replaceChildren();
  for (const row of data) {
    const tr = document.createElement('tr');
    for (const value of row) { const td = document.createElement('td'); td.textContent = value; tr.append(td); }
    el('rows').append(tr);
  }
}
function status(message) { el('status').textContent = message; }
function safe(handler) { return async () => { try { await handler(); } catch (error) { status('No se completó la operación: ' + error.message); } }; }
el('add').onclick = safe(() => {
  db.run('INSERT INTO inventory(product,quantity) VALUES(?,?)', ['Producto de prueba', 5]); render();
  status('Registro añadido. Si la copia ya existía, este cambio no estará en ella.');
});
el('backup').onclick = safe(async () => {
  // Capture bytes and logical rows synchronously before hashing.
  const captured = db.export(); const rows = JSON.stringify(records(db));
  const digest = await hash(captured);
  snapshot = captured; expected = rows; checksum = digest;
  el('digest').textContent = 'SHA-256 de la copia: ' + checksum;
  el('download').disabled = false; el('restore').disabled = false;
  status('Copia completa creada: ' + JSON.parse(expected).length + ' registros. Descárgala para conservarla fuera de esta pestaña.');
});
el('download').onclick = safe(() => {
  const url = URL.createObjectURL(new Blob([snapshot], {type:'application/octet-stream'}));
  const link = document.createElement('a'); link.href = url; link.download = 'backup-inventory.sqlite'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('Descarga solicitada. Conserva también el SHA-256 mostrado para comprobar la copia.');
});
el('incident').onclick = safe(() => { db.run('DELETE FROM inventory'); render(); status('Pérdida simulada: inventario vacío. La copia guardada permanece disponible.'); });
el('restore').onclick = safe(async () => {
  const started = performance.now();
  const bytes = snapshot; const savedHash = checksum; const savedRows = expected;
  if (await hash(bytes) !== savedHash) throw new Error('SHA-256 distinto al original.');
  const candidate = new SQL.Database(bytes);
  try { integrity(candidate); if (JSON.stringify(records(candidate)) !== savedRows) throw new Error('El inventario no coincide con la copia.'); }
  catch (error) { candidate.close(); throw error; }
  db.close(); db = candidate; render();
  status('Restauración verificada: ' + records(db).length + ' registros, integridad OK, contenido idéntico a la copia. Tiempo local: ' + (performance.now()-started).toFixed(1) + ' ms.');
});
(async () => {
  try {
    SQL = await initSqlJs({locateFile:file => 'https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/' + file});
    db = new SQL.Database();
    db.run('CREATE TABLE inventory(id INTEGER PRIMARY KEY, product TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity>=0))');
    for (const [product,quantity] of [['Cuaderno',20],['Lapicero',40],['Mochila',10]]) db.run('INSERT INTO inventory(product,quantity) VALUES(?,?)',[product,quantity]);
    integrity(db); render(); for (const id of ['add','backup','incident']) el(id).disabled = false;
    status('Base lista. Crea la copia antes de simular una pérdida.');
  } catch (error) { status('No se pudo cargar SQLite. Comprueba la conexión con el CDN y recarga. ' + error.message); }
})();
