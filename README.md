This codemod transforms import specifiers in source-code from the broken state TypeScript's compiler (`tsc`) requires into proper ones. This is a one-and-done process, and the updated source-code should be committed to your version control (eg git); thereafter, source-code import statements should be authored to be compliant with the ECMAScript (JavaScript) standard.

> [!CAUTION]
> This will change your source-code. Commit or stash any unsaved changes before running this package.

```sh
npx correct-ts-specifiers start
```

This is useful when source-code is processed by standards-compliant software like Node.js.

> [!IMPORTANT]
> If you want your source-code to still be processessable with `tsc` (for instance, to run type-checking as a lint or test step), you'll need to set [`allowImportingTsExtensions`](https://www.typescriptlang.org/tsconfig/#allowImportingTsExtensions). You will need to use a different transpiler to convert your source-code to JavaScript (you probably should be doing that anyway).

Before:

```ts
import { URL } from 'node:url';

import { bar } from '@dep/bar';
import { foo } from 'foo';

import { Cat } from './Cat.ts';
import { Dog } from './Dog/index.mjs';
import { baseUrl } from './config.js';
export { Zed } from './zed';

// should be unchanged

export const makeLink = (path: URL) => (new URL(path, baseUrl)).href;

const cat = new Cat('Milo');
const dog = new Dog('Otis');
```

After:

```ts
import { URL } from 'node:url';

import { bar } from '@dep/bar';
import { foo } from 'foo';

import { Cat } from './Cat.ts';
import { Dog } from './Dog/index.mts';
import { baseUrl } from './config.js';
export type { Zed } from './zed.d.ts';

// should be unchanged

export const makeLink = (path: URL) => (new URL(path, baseUrl)).href;

const cat = new Cat('Milo');
const dog = new Dog('Otis');
```
