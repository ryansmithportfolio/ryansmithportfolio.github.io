/**
 * Smoke tests: the landing page and every project route, in the two layouts.
 *
 * Projects and lenses are read from data/site.config.js, so a new record is
 * covered without touching this file. These check behaviour and wiring, not
 * pixels; ADR-0002 explains why pixel diffs are not a usable oracle here.
 */

import { test, expect } from '@playwright/test';
import config from '../data/site.config.js';

const WIDE = { width: 1440, height: 900 };
const COMPACT = { width: 390, height: 844 };

const entries = Object.values(config.entries || {});
const segments = config.segments || [];
const isListed = (slug) => config.entries?.[slug]?.listed !== false;

/** Fail the test on any console warning or error, or an uncaught exception. */
function watchConsole(page) {
  const problems = [];
  page.on('console', (message) => {
    if (['warning', 'error'].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

/** The on-screen midpoint of a lens's band, where a visitor would hover it. */
async function bandMidpoint(page, lensId) {
  return page.evaluate((id) => {
    const band = Array.from(document.querySelectorAll('.seg')).find((seg) => seg.id === `seg-${id}`)?.querySelector('.seg__band');
    const point = band.getPointAtLength(band.getTotalLength() / 2);
    const m = band.getScreenCTM();
    return { x: point.x * m.a + m.e, y: point.y * m.d + m.f };
  }, lensId);
}

const litSlugs = (page) =>
  page.$$eval('.hex.is-lit', (nodes) => nodes.map((node) => node.dataset.slug).sort());

test.describe('landing, wide', () => {
  test.use({ viewport: WIDE });

  test('loads clean, with a node per listed project', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/');
    await expect(page.locator('#dial .seg')).toHaveCount(segments.length);
    const listed = segments.flatMap((segment) => segment.entries || []).filter(isListed);
    await expect(page.locator('#dial .hex')).toHaveCount(listed.length);
    expect(problems).toEqual([]);
  });

  test('the featured lens is lit on arrival', async ({ page }) => {
    await page.goto('/');
    const featured = segments.find((segment) => segment.featured) || segments[0];
    await expect(page.locator(`#seg-${featured.id}.is-featured`)).toHaveCount(1);
    expect(await litSlugs(page)).toEqual((featured.entries || []).filter(isListed).sort());
  });

  for (const segment of segments) {
    test(`hovering ${segment.id} lights each of its nodes with a visible wire`, async ({ page }) => {
      const problems = watchConsole(page);
      await page.goto('/');
      const point = await bandMidpoint(page, segment.id);
      await page.mouse.move(point.x, point.y);

      const expected = (segment.entries || []).filter(isListed).sort();
      await expect.poll(() => litSlugs(page)).toEqual(expected);

      // A wire whose colour token is missing still "lights", with stroke none.
      // This is the check that would have caught the --case-light regression.
      const strokes = await page.$$eval(`.hex.is-lit .hex__wire`, (wires) =>
        wires.map((wire) => getComputedStyle(wire).stroke),
      );
      expect(strokes).toHaveLength(expected.length);
      for (const stroke of strokes) expect(stroke).not.toBe('none');

      await page.mouse.move(2, 2);
      await expect.poll(() => litSlugs(page)).toEqual([]);
      expect(problems).toEqual([]);
    });
  }
});

test.describe('landing, compact', () => {
  test.use({ viewport: COMPACT });

  test('lists every lens and draws no wires', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/');
    await expect(page.locator('#dial.dial--compact')).toHaveCount(1);
    await expect(page.locator('#dial .seg')).toHaveCount(segments.length);
    await expect(page.locator('#dial .hex__wire')).toHaveCount(0);
    expect(problems).toEqual([]);
  });
});

test.describe('project routes', () => {
  test.use({ viewport: WIDE });

  for (const entry of entries) {
    test(`#/${entry.slug} opens its modal on a cold load`, async ({ page }) => {
      const problems = watchConsole(page);
      await page.goto(`/#/${entry.slug}`);

      await expect(page.locator('.overlay.is-open')).toBeVisible();
      await expect(page.locator('#project-detail-title')).not.toBeEmpty();

      if (entry.content) {
        await expect(page.locator('.overlay .detail__case-study')).toBeVisible();
        await expect(page.locator('.overlay .detail__section').first()).toBeVisible();
      }

      // Every image in the card actually loaded.
      const broken = await page.$$eval('.overlay img', (images) =>
        images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src')),
      );
      expect(broken).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(page.locator('.overlay.is-open')).toHaveCount(0);
      expect(problems).toEqual([]);
    });
  }
});
