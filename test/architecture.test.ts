// Structure rules ESLint can't express. Layering and import rules live in eslint.config.mjs.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const files = walk(SRC).map((f) => relative(SRC, f).split(sep).join('/'));
const features = readdirSync(join(SRC, 'features'));

/** Folders a feature may have. Anything else is a sign the feature is turning into a mini-app. */
const FEATURE_FOLDERS = new Set(['screens', 'components', 'stores', 'lib']);

describe('features', () => {
  it.each(features)('%s exposes a public API through index.ts', (feature) => {
    expect(files).toContain(`features/${feature}/index.ts`);
  });

  it.each(features)('%s only has the standard folders', (feature) => {
    const entries = readdirSync(join(SRC, 'features', feature)).filter((e) => e !== 'index.ts');
    expect(entries.filter((e) => !FEATURE_FOLDERS.has(e))).toEqual([]);
  });

  it('names route-level components *Screen or *Layout', () => {
    const screens = files.filter((f) => /^features\/[^/]+\/screens\//.test(f));
    expect(screens.filter((f) => !/(Screen|Layout)\.tsx$/.test(f))).toEqual([]);
  });
});

describe('routes', () => {
  // Expo Router files only pick a screen. Logic in a route file can't be reused or tested.
  const THIN_ROUTE = /^export \{ \w+ as default \} from '@\/features\/[a-z-]+';\n$/;

  it('only re-export a feature screen (the root layout is the composition root)', () => {
    const routes = files.filter((f) => f.startsWith('app/') && f !== 'app/_layout.tsx');
    expect(routes.length).toBeGreaterThan(0);
    expect(routes.filter((f) => !THIN_ROUTE.test(readFileSync(join(SRC, f), 'utf8')))).toEqual([]);
  });
});

describe('naming', () => {
  const named = files.filter((f) => !f.startsWith('app/') && basename(f) !== 'index.ts');

  it('uses PascalCase for components (.tsx) and kebab-case for everything else (.ts)', () => {
    const wrong = named.filter((f) => {
      const name = basename(f, extname(f));
      return extname(f) === '.tsx' ? !/^[A-Z][A-Za-z0-9]*$/.test(name) : !/^[a-z][a-z0-9-]*$/.test(name);
    });
    expect(wrong).toEqual([]);
  });

  it('has no grab-bag modules', () => {
    expect(files.filter((f) => /^(helpers?|utils?|misc|common|stuff)$/i.test(basename(f, extname(f))))).toEqual([]);
  });

  it('has no versioned copies — change the code, or put it behind a flag', () => {
    const segments = files.flatMap((f) => f.split('/').map((s) => s.replace(/\.tsx?$/, '')));
    expect(segments.filter((s) => /(V\d+|Old|Legacy|Copy|Backup|Deprecated)$/i.test(s))).toEqual([]);
  });
});
