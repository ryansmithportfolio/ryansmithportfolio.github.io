#!/usr/bin/env node
/**
 * Fails when the site points at a local file that is not there, or at a
 * #/<slug> route with no record behind it.
 *
 * Checked:
 *   - href and src attributes in each HTML entry point
 *   - every href, src and content value in data/site.config.js
 *   - every figure src in the content files those records point at
 *   - url(...) in the stylesheets the entry points link
 *
 * External URLs (any scheme, or //host) are skipped: whether a third-party site
 * is up is not something a pull request can fix, and CI should not flake on it.
 * In-page anchors (#id) are skipped too. No dependencies.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY_POINTS = ['index.html'];
const ROUTE_PREFIX = '#/';

const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const isExternal = (ref) => /^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('//');

const { default: config } = await import(pathToFileURL(join(ROOT, 'data/site.config.js')).href);
const entries = config?.entries && typeof config.entries === 'object' ? config.entries : {};
const slugs = new Set(Object.values(entries).map((entry) => entry?.slug).filter(Boolean));

const problems = [];
let checked = 0;

/**
 * Check one reference. `base` is the directory a relative path resolves from:
 * the repo root for the page and config, the stylesheet's own folder for CSS.
 */
function check(ref, where, base = '') {
  if (typeof ref !== 'string' || ref.trim() === '') return;
  ref = ref.trim();
  if (isExternal(ref)) return;
  checked += 1;

  if (ref.startsWith(ROUTE_PREFIX)) {
    const slug = decodeURIComponent(ref.slice(ROUTE_PREFIX.length));
    if (!slugs.has(slug)) problems.push(`${where}: ${ref} has no record with slug "${slug}"`);
    return;
  }
  if (ref.startsWith('#')) return;

  const path = normalize(join(base, decodeURI(ref.split(/[?#]/)[0])));
  if (path.startsWith('..')) {
    problems.push(`${where}: ${ref} points outside the site`);
  } else if (!existsSync(join(ROOT, path))) {
    problems.push(`${where}: ${ref} does not exist`);
  }
}

/** Every href, src and content string anywhere inside a config value. */
function walkConfig(value, where) {
  if (Array.isArray(value)) value.forEach((item, i) => walkConfig(item, `${where}[${i}]`));
  else if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) {
      if (['href', 'src', 'content'].includes(key) && typeof inner === 'string') check(inner, `${where}.${key}`);
      else walkConfig(inner, `${where}.${key}`);
    }
  }
}

const stylesheets = new Set();
for (const page of ENTRY_POINTS) {
  const html = read(page);
  for (const [, ref] of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)) check(ref, page, dirname(page));
  for (const [, href] of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/g)) {
    if (!isExternal(href)) stylesheets.add(join(dirname(page), href));
  }
}

walkConfig(config, 'site.config.js');

for (const entry of Object.values(entries)) {
  if (typeof entry?.content !== 'string' || !existsSync(join(ROOT, entry.content))) continue;
  let content;
  try {
    content = JSON.parse(read(entry.content));
  } catch (error) {
    problems.push(`${entry.content}: not valid JSON (${error.message})`);
    continue;
  }
  (content.sections || []).forEach((section, i) => {
    if (section?.figure) check(section.figure.src, `${entry.content} sections[${i}].figure.src`);
  });
}

for (const sheet of stylesheets) {
  const css = read(sheet).replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, , ref] of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
    if (!ref.startsWith('data:')) check(ref, sheet, dirname(sheet));
  }
}

if (problems.length > 0) {
  console.error(`Links and assets: ${problems.length} broken\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`Links and assets: ok (${checked} local references, ${slugs.size} slugs)`);
