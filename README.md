This codemod transforms import specifiers in source-code from the broken state TypeScript's compiler (`tsc`) requires into proper ones. This is a one-and-done process, and the updated source-code should be committed to your version control (eg git).

This is useful when source-code is processed by standards-compliant software like Node.js.

> [!IMPORTANT]
> If you want your source-code to still be processessable with `tsc` (for instance, to run type-checking as a lint or test step), you'll need to set [`allowImportingTsExtensions`](https://www.typescriptlang.org/tsconfig/#allowImportingTsExtensions). You will need to use a different transpiler to convert your source-code to JavaScript (you probably should be doing that anyway).

Before:

```ts
import { PathLike } from 'node:path';
import { Cat } from './Cat';
import { baseUrl } from './config.js';

export { Zed } from './zed';

export const makeLink = (path: PathLike) => (new URL(path, baseUrl)).href;

const cat = new Cat();
```

After:

```ts
import type { PathLike } from 'node:path';
import { Cat } from './Cat.ts';
import { baseUrl } from './config.js';

export type { Zed } from './zed.d.ts';

export const makeLink = (path: PathLike) => (new URL(path, baseUrl)).href;

const cat = new Cat();
```
