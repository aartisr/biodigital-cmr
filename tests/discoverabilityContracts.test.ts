import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('public discoverability assets preserve accurate creator attribution and safety context', () => {
  const html = read('index.html');
  const robots = read('public/robots.txt');
  const llms = read('public/llms.txt');

  assert.match(html, /Aarti Sri Ravikumar/);
  assert.match(html, /https:\/\/ai-aarti\.com/);
  assert.match(html, /https:\/\/bdcmr\.ai-aarti\.com\//);
  assert.match(html, /name="robots" content="index, follow/);
  assert.match(html, /application\/ld\+json/);
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \/$/m);
  assert.match(robots, /Sitemap: https:\/\/bdcmr\.ai-aarti\.com\/sitemap\.xml/);
  assert.match(llms, /not a medical device/i);
  assert.match(llms, /Aarti Sri Ravikumar/);
});
