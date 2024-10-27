import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { FSAbsolutePath, Specifier } from './index.d.ts';


/**
 * Determine the fully resolved module indicated by the specifier.
 * @param parentPath The module containing the provided specifier.
 * @param specifier The specifier to potentially correct.
 */
export function resolveSpecifier(
	parentPath: FSAbsolutePath,
	specifier: Specifier,
): FSAbsolutePath {
	const parentUrl = `${pathToFileURL(dirname(parentPath)).href}/`;

	if (URL.canParse(specifier)) return specifier;

	// import.meta.resolve gives access to node's resolution algorithm, which is necessary to handle
	// a myriad of non-obvious routes, like pJson subimports and the result of any hooks that may be
	// helping, such as ones facilitating tsconfig's "paths"
	let resolvedSpecifierUrl: URL['href'];

	try {
		resolvedSpecifierUrl = import.meta.resolve(specifier, parentUrl);
	} catch (err) {
		if (err && typeof err === 'object') Object.assign(err, { specifier, parentPath });
		throw err;
	}

	if (!resolvedSpecifierUrl.startsWith('file://')) return specifier;

	return fileURLToPath(resolvedSpecifierUrl) as FSAbsolutePath;
}
