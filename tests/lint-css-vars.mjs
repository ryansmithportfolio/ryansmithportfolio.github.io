#!/usr/bin/env node
/**
 * Fails when a stylesheet uses var(--x) with no fallback and nothing defines --x.
 *
 * An undefined custom property does not error in a browser. It makes the whole
 * declaration invalid at computed-value time, so the property quietly falls
 * back to its initial value: a stroke becomes `none`, a colour becomes black.
 * That is how deleting --case-light left Craft's wire invisible with no warning
 * anywhere (decisions/ADR-0009).
 *
 * Scope is what the live site loads: every stylesheet linked from an HTML entry
 * point. A property counts as defined if any of these declare it:
 *   - a `--x:` declaration in one of the linked stylesheets
 *   - a `setProperty('--x', …)` call in js/ (the dial writes per-segment colours
 *     and type sizes at runtime)
 *   - an inline `style="--x: …"` in the entry point
 *
 * No dependencies; run with `node tests/lint-css-vars.mjs`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY_POINTS = ['index.html'];

const read = (path) => readFileSync(join(ROOT, path), 'utf8');

/** Every file under dir with one of the extensions, as repo-relative paths. */
function walk(dir, exts) {
  const out = [];
  for (const name of readdirSync(join(ROOT, dir))) {
    const path = join(dir, name);
    if (statSync(join(ROOT, path)).isDirectory()) out.push(...walk(path, exts));
    else if (exts.some((ext) => name.endsWith(ext))) out.push(path);
  }
  return out;
}

/** Comments can mention var(--x) in prose; they are not uses. Keeps line numbers. */
const stripComments = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));

const stylesheets = new Set();
const inlineDefined = new Set();
for (const page of ENTRY_POINTS) {
  const html = read(page);
  for (const [, href] of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/g)) {
    if (!/^[a-z]+:|^\/\//i.test(href)) stylesheets.add(join(dirname(page), href));
  }
  for (const [, style] of html.matchAll(/style=["']([^"']*)["']/g)) {
    for (const [, name] of style.matchAll(/(--[\w-]+)\s*:/g)) inlineDefined.add(name);
  }
}

const defined = new Set(inlineDefined);
const sources = new Map();
for (const sheet of stylesheets) {
  const css = stripComments(read(sheet));
  sources.set(sheet, css);
  for (const [, name] of css.matchAll(/(--[\w-]+)\s*:/g)) defined.add(name);
}
for (const file of walk('js', ['.js'])) {
  for (const [, name] of read(file).matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)) defined.add(name);
}

const problems = [];
for (const [sheet, css] of sources) {
  css.split('\n').forEach((line, i) => {
    for (const [, name, comma] of line.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
      if (!comma && !defined.has(name)) problems.push(`${sheet}:${i + 1}  ${name} is used but never defined`);
    }
  });
}

if (problems.length > 0) {
  console.error(`CSS custom properties: ${problems.length} undefined\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(
  `CSS custom properties: ok (${defined.size} defined, ${[...stylesheets].map((s) => relative(ROOT, join(ROOT, s))).join(', ')})`,
);
