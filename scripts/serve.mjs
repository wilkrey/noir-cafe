/**
 * Минимальный статический сервер для разработки и просмотра.
 * Без зависимостей: только встроенный модуль node:http.
 *
 *   npm start            → http://localhost:4173
 *   PORT=8080 npm start  → другой порт
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

// Файлы, которые нельзя отдавать наружу
const BLOCKED = /^\/(scripts|node_modules|\.git)(\/|$)|package(-lock)?\.json$|\.env/;

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);

    if (BLOCKED.test(pathname)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    let filePath = normalize(join(ROOT, pathname));
    if (!filePath.startsWith(ROOT + sep) && filePath !== ROOT) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    const body = await readFile(filePath).catch(() => null);
    if (!body) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — страница не найдена');
      return;
    }

    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(body);
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('Internal error');
  }
});

server.listen(PORT, () => {
  console.log(`\n  NOIR Café → http://localhost:${PORT}\n  Остановить: Ctrl+C\n`);
});
