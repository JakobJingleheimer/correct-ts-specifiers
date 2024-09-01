import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { FSAbsolutePath, Specifier } from './index.d.ts';


export function resolveSpecifier(
	parentPath: FSAbsolutePath,
	specifier: Specifier,
): FSAbsolutePath {
	const parentUrl = `${pathToFileURL(dirname(parentPath)).href}/`;

	const resolvedSpecifier: FSAbsolutePath = URL.canParse(specifier)
    ? specifier
    // import.meta.resolve gives access to node's resolution algorithm, which is necessary to handle
		// a myriad of non-obvious routes, like pJson subimports and the result of any hooks that may be
		// helping, such as ones facilitating tsconfig's "paths"
		: fileURLToPath(import.meta.resolve(specifier, parentUrl));

	return resolvedSpecifier;
}
