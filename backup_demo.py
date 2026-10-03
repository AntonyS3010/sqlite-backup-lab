"""Disposable SQLite backup/restore lab. Standard library only; no real data."""
import hashlib
import json
import sqlite3
import tempfile
import time
from pathlib import Path


def verify(connection):
    result = connection.execute('PRAGMA integrity_check').fetchall()
    if result != [('ok',)]:
        raise ValueError('Database integrity check failed')
    return connection.execute('SELECT id, product, quantity FROM inventory ORDER BY id').fetchall()


def run_lab(directory):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=False)
    live = sqlite3.connect(directory / 'inventory.sqlite')
    try:
        live.execute('CREATE TABLE inventory(id INTEGER PRIMARY KEY, product TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity >= 0))')
        live.executemany('INSERT INTO inventory VALUES(?,?,?)', [(1, 'Cuaderno', 20), (2, 'Lapicero', 40), (3, 'Mochila', 10)])
        live.commit()
        expected = verify(live)
        target = directory / 'backup.sqlite'
        with sqlite3.connect(target) as snapshot:
            live.backup(snapshot)
            assert verify(snapshot) == expected
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        (directory / 'backup.sha256').write_text(digest + '\n', encoding='utf-8')
        dump = '\n'.join(live.iterdump())
        (directory / 'backup.sql').write_text(dump, encoding='utf-8')
        # This deletion affects only generated disposable data in this lab.
        live.execute('DELETE FROM inventory')
        live.commit()
        assert verify(live) == []
        started = time.perf_counter()
        if hashlib.sha256(target.read_bytes()).hexdigest() != digest:
            raise ValueError('Backup checksum mismatch')
        with sqlite3.connect(target) as snapshot:
            verify(snapshot)
            snapshot.backup(live)
        restored = verify(live)
        assert restored == expected
        duration = time.perf_counter() - started
        with sqlite3.connect(':memory:') as logical:
            logical.executescript(dump)
            assert verify(logical) == expected
        report = {'engine': 'SQLite', 'initial_rows': len(expected), 'rows_after_incident': 0,
                  'restored_rows': len(restored), 'integrity_check': 'ok', 'logical_restore': 'ok',
                  'restore_seconds': round(duration, 6), 'backup_sha256': digest,
                  'scope': 'Synthetic local lab; no production RTO or RPO guarantee'}
        (directory / 'report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
        return report
    finally:
        live.close()


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', help='New directory for generated synthetic lab files')
    args = parser.parse_args()
    if args.output:
        report = run_lab(args.output)
    else:
        with tempfile.TemporaryDirectory() as temporary:
            report = run_lab(Path(temporary) / 'lab')
    print(json.dumps(report, indent=2))
