# Correct TypeScript specifiers

![tests](https://github.com/JakobJingleheimer/correct-ts-specifiers/actions/workflows/ci.yml/badge.svg)

This package transforms import specifiers in source-code from the broken state TypeScript's compiler (`tsc`) requires into proper ones. This is a one-and-done process, and the updated source-code should be committed to your version control (eg git); thereafter, source-code import statements should be authored to be compliant with the ECMAScript (JavaScript) standard.

This is useful when source-code is processed by standards-compliant software like Node.js.

This package does not just blindly find & replace file extensions within specifiers: It confirms that the targeted file of replacement specifier actually exists; in cases where there is ambiguity (such as two files with the same basename in the same location but different relevant file extensions), it logs an error, skips that specifier, and continues processing.

This package does not confirm that the targetted module in the replacement contains the exports cited in the import statement. This should not actually ever result in a problem because ambiguous cases are skipped (so if there is a problem, it existed before the migration started). Merely running your source-code after the mirgration completes will confirm all is good (if there are problems, node will error, citing exactly where the problems are).

## Running

> [!CAUTION]
> This will change your source-code. Commit or stash any unsaved changes before running this package.

```sh
npx codemod@latest correct-ts-specifiers
```

If you're using `tsconfig`'s `paths`, you will need a loader like [`nodejs-loaders/dev/alias`](https://github.com/JakobJingleheimer/nodejs-loaders?tab=readme-ov-file#alias)


```sh
npm i nodejs-loaders

NODE_OPTIONS="--loader=nodejs-loaders/dev/alias" \
npx codemod@latest correct-ts-specifiers
```

> [!IMPORTANT]
> If you want your source-code to still be processessable with `tsc` (for instance, to run type-checking as a lint or test step), you'll need to set [`allowImportingTsExtensions`](https://www.typescriptlang.org/tsconfig/#allowImportingTsExtensions). You will need to use a different transpiler to convert your source-code to JavaScript (you probably should be doing that anyway).

## Supported cases

* no file extension → `.cts`, `.mts`, `.js`, `.ts`, `.d.cts`, `.d.mts`, or `.d.ts`
* `.cjs` → `.cts`, `.mjs` → `.mts`, `.js` → `.ts`
* `.js` → `.d.cts`, `.d.mts`, or `.d.ts`
* Package.json subimports
* tsconfig paths (requires a loader)
* Directory / commonjs-like specifiers

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

// should be unchanged

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

// should be unchanged

export const makeLink = (path: URL) => (new URL(path, baseUrl)).href;

const nil = await import('./nil.ts');

const bird = new Bird('Tweety');
const cat = new Cat('Milo');
const dog = new Dog('Otis');
```
