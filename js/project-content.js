/**
 * Fetches the optional content file a project record points at, and hands
 * back a normalized case study. See decisions/ADR-0008.
 *
 * The file is fetched the first time its modal opens, not on page load, so a
 * visitor who never opens it never downloads it. Results are kept in memory for
 * the life of the page only; nothing is written to browser storage.
 *
 * Nothing here throws. A missing or malformed file costs the case study, not
 * the card: the caller gets null and the modal keeps what it already shows.
 */

import { normalizeCaseStudy } from './projects.js';

/** slug -> Promise<case study | null>. A failure is not cached, so it can retry. */
const cache = new Map();

/**
 * @param {{slug: string, content: string}} project a record from js/projects.js
 * @returns {Promise<object|null>}
 */
export function loadProjectContent(project) {
  if (!project || !project.content) return Promise.resolve(null);
  if (cache.has(project.slug)) return cache.get(project.slug);

  const pending = fetch(project.content)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((json) => normalizeCaseStudy(json, project.slug))
    .catch((error) => {
      console.warn(`[projects] "${project.slug}": could not load ${project.content} (${error.message}).`);
      cache.delete(project.slug);
      return null;
    });

  cache.set(project.slug, pending);
  return pending;
}

export default loadProjectContent;
