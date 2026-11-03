/**
 * Проверка проекта без внешних зависимостей:
 *  1. Синтаксис всех JS-модулей (через node --check).
 *  2. Все локальные ссылки в index.html и CSS указывают на существующие файлы.
 *  3. Все id, на которые ссылаются JS-модули, есть в разметке.
 *  4. Баланс парных HTML-тегов для основных секций.
 */
import { execFileSync } from 'node:child_process';
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
let errors = 0;
let warnings = 0;

const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  errors += 1;
  console.log(`  ✗ ${msg}`);
};
const warn = (msg) => {
  warnings += 1;
  console.log(`  ! ${msg}`);
};
const section = (title) => console.log(`\n${title}`);

const exists = (p) =>
  access(p).then(
    () => true,
    () => false
  );

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const full = join(dir, e.name);
      return e.isDirectory() ? walk(full) : [full];
    })
  );
  return files.flat();
}

// ---------------------------------------------------------------- 1. JS syntax
section('1. Синтаксис JavaScript');
const jsFiles = (await walk(join(ROOT, 'src'))).filter((f) => f.endsWith('.js'));
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    ok(relative(ROOT, file));
  } catch (error) {
    fail(`${relative(ROOT, file)}\n${error.stderr?.toString() ?? error.message}`);
  }
}

// ---------------------------------------------------------- 2. Local references
section('2. Локальные ссылки');
const html = await readFile(join(ROOT, 'index.html'), 'utf8');
const css = (await Promise.all(
  (await walk(join(ROOT, 'src/styles'))).map((f) => readFile(f, 'utf8'))
)).join('\n');

const refRegex = /(?:src|href)="(\.\/[^"#?]+|\/[^"#?]+)"/g;
const refs = new Set([...html.matchAll(refRegex)].map((m) => m[1]));

for (const ref of refs) {
  if (ref.startsWith('http') || ref.startsWith('mailto:') || ref.startsWith('tel:')) continue;
  const target = ref.startsWith('./') ? join(ROOT, ref.slice(2)) : join(ROOT, ref.slice(1));
  (await exists(target)) ? ok(ref) : fail(`Файл не найден: ${ref}`);
}

// url(...) внутри CSS. Сначала вырезаем data:-URI целиком: внутри них
// лежат SVG-фильтры вида url(#n), которые не являются файлами.
const cssWithoutData = css.replace(/url\((['"]?)data:[\s\S]*?\1\)/g, '');
const cssUrls = [...cssWithoutData.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => m[2]);
for (const url of new Set(cssUrls)) {
  if (url.startsWith('http') || url.startsWith('#') || url.startsWith('%23')) continue;
  (await exists(join(ROOT, 'src/styles', url)))
    ? ok(`CSS url: ${url}`)
    : fail(`CSS: файл не найден ${url}`);
}

// ------------------------------------------------------------ 3. Element IDs
section('3. Соответствие id в JS и разметке');
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const jsSources = (await Promise.all(jsFiles.map((f) => readFile(f, 'utf8')))).join('\n');

const jsIdRefs = new Set([
  ...[...jsSources.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((m) => m[1]),
]);
for (const id of jsIdRefs) {
  htmlIds.has(id) ? ok(`#${id}`) : warn(`JS ищет #${id}, но в разметке его нет (модуль просто пропустит блок)`);
}

// Все якорные ссылки #hash должны вести на существующий id
const anchors = new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]));
for (const anchor of anchors) {
  if (anchor === 'top' || anchor === '') {
    ok(`#${anchor || '(пусто)'}`);
    continue;
  }
  htmlIds.has(anchor) ? ok(`якорь #${anchor}`) : fail(`Якорь #${anchor} не имеет цели в разметке`);
}

// ------------------------------------------------------------- 4. Tag balance
section('4. Баланс тегов');
const pairedTags = ['section', 'article', 'header', 'footer', 'main', 'nav', 'div', 'ul', 'ol', 'li', 'form', 'figure', 'button', 'label', 'select', 'blockquote'];
for (const tag of pairedTags) {
  const opens = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) ?? []).length;
  const closes = (html.match(new RegExp(`</${tag}>`, 'g')) ?? []).length;
  opens === closes
    ? ok(`<${tag}> ${opens}/${closes}`)
    : fail(`<${tag}>: открывающих ${opens}, закрывающих ${closes}`);
}

// ---------------------------------------------------------------- Summary
console.log(`\nИтог: ошибок ${errors}, предупреждений ${warnings}`);
if (errors > 0) {
  process.exitCode = 1;
} else {
  console.log('Проект прошёл проверку.');
}
