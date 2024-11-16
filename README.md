# Correct TypeScript Specifiers

![tests](https://github.com/JakobJingleheimer/correct-ts-specifiers/actions/workflows/ci.yml/badge.svg)

This package transforms import specifiers in source-code from the broken state TypeScript's compiler (`tsc`) required (prior TypeScript v5.8) into proper ones. This is useful when source-code is processed by standards-compliant software like Node.js.

This is a one-and-done process, and the updated source-code should be committed to your version control (ex git); thereafter, source-code import statements should be authored to be compliant with the ECMAScript (JavaScript) standard.

> [!TIP]
> Those using `tsc` to compile code will need to enable [``](); those using `tsc` for only type-checking (ex via a lint/test step like `npm run test:types`) will need to enable [`allowImportingTsExtensions`](https://www.typescriptlang.org/tsconfig/#allowImportingTsExtensions) (this requires additional compile options be set—see the cited documentation);

This package does not just blindly find & replace file extensions within specifiers: It confirms that the replacement specifier actually exists; in ambiguous cases (such as two files with the same basename in the same location but different relevant file extensions like `/tmp/foo.js` and `/tmp/foo.ts`), it logs an error, skips that specifier, and continues processing.

> [!CAUTION]
> This package does not confirm that imported modules contain the desired exports. This _shouldn't_ actually ever result in a problem because ambiguous cases are skipped (so if there is a problem, it existed before the migration started). Merely running your source-code after the mirgration completes will confirm all is well (if there are problems, node will error, citing exactly where the problems are).

> [!TIP]
> Node.js requires the `type` keyword be present on type imports. For own code, this package usually handles that. However, in some cases and for node modules, it does not. Robust tooling already exists that will automatically fix this, such as [`consistent-type-imports` via typescript-lint](https://typescript-eslint.io/rules/consistent-type-imports) and [`use-import-type` via biome](https://biomejs.dev/linter/rules/use-import-type/). If your source code needs that, first run this codemod and then one of those fixers.

## Running

> [!CAUTION]
> This will change your source-code. Commit any unsaved changes before running this package.

```sh
npx codemod@latest correct-ts-specifiers
```

If you're using `tsconfig`'s `paths`, you will need a loader like [`@nodejs-loaders/alias`](https://github.com/JakobJingleheimer/nodejs-loaders/blob/main/packages/alias?tab=readme-ov-file)


```sh
npm i @nodejs-loaders/alias

NODE_OPTIONS="--loader=@nodejs-loaders/alias" \
npx codemod@latest correct-ts-specifiers
```

## Supported cases

* no file extension → `.cts`, `.mts`, `.js`, `.ts`, `.d.cts`, `.d.mts`, or `.d.ts`
* `.cjs` → `.cts`, `.mjs` → `.mts`, `.js` → `.ts`
* `.js` → `.d.cts`, `.d.mts`, or `.d.ts`
* Package.json subimports
* tsconfig paths (requires a loader)
* Commonjs-like directory specifiers

Before:

```ts
import { URL } from 'node:url';

import { bar } from '@dep/bar';
import { foo } from 'foo';

import { Bird } from './Bird';          // a directory
import { Cat } from './Cat.ts';
import { Dog } from '…/Dog/index.mjs';  // tsconfig paths
import { baseUrl } from '#config.js';   // package.json imports

export { Zed } from './zed';

export const makeLink = (path: URL) => (new URL(path, baseUrl)).href;

const nil = await import('./nil.js');

const bird = new Bird('Tweety');
const cat = new Cat('Milo');
const dog = new Dog('Otis');
```

After:

```ts
import { URL } from 'node:url';

import { bar } from '@dep/bar';
import { foo } from 'foo';

import { Bird } from './Bird/index.ts';
import { Cat } from './Cat.ts';
import { Dog } from '…/Dog/index.mts';  // tsconfig paths
import { baseUrl } from '#config.js';   // package.json imports

export type { Zed } from './zed.d.ts';

export const makeLink = (path: URL) => (new URL(path, baseUrl)).href;

const nil = await import('./nil.ts');

const bird = new Bird('Tweety');
const cat = new Cat('Milo');
const dog = new Dog('Otis');
```
