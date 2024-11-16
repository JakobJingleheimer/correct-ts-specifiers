
import { isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type {
	FSAbsolutePath,
	NodeError,
	ResolvedSpecifier,
	Specifier,
} from './index.d.ts';
import { getNotFoundUrl } from './get-not-found-url.ts';
import { getPackageJSON } from './get-package-json.ts';
import { resolvesToNodeModule } from './resolves-to-node-module.ts';


/**
 * Determine the fully resolved module location indicated by the specifier.
 * @param parentPath The module containing the provided specifier.
 * @param specifier The specifier to potentially correct.
 */
export function resolveSpecifier(
	parentPath: FSAbsolutePath | ResolvedSpecifier,
	specifier: Specifier,
): FSAbsolutePath {
	if (URL.canParse(specifier)) return fileURLToPath(specifier);

	// import.meta.resolve() gives access to node's resolution algorithm, which is necessary to handle
	// a myriad of non-obvious routes, like pjson subimports and the result of any hooks that may be
	// helping, such as ones facilitating tsconfig's "paths"
	let resolvedSpecifierUrl: URL['href'] | undefined;
	const parentUrl = isAbsolute(parentPath)
		? pathToFileURL(parentPath).href
		: parentPath;

	try {
		const interimResolvedUrl = import.meta.resolve(specifier, parentUrl) as ResolvedSpecifier;

		if (resolvesToNodeModule(interimResolvedUrl, parentUrl)) return specifier;

		resolvedSpecifierUrl = interimResolvedUrl; // ! let continue to `fileURLToPath` below
	} catch (err) {
		if (!(err instanceof Error)) throw err;

		if (
			(err as NodeError).code === 'ERR_MODULE_NOT_FOUND'
			&& resolvesToNodeModule(getNotFoundUrl(err), parentUrl)
		) {
			return specifier;
		}

		if (!resolvedSpecifierUrl) {
			Object.assign(err, { specifier, parentPath });
			throw err;
		}
	}

	if (!resolvedSpecifierUrl?.startsWith('file://')) return specifier;

	return fileURLToPath(resolvedSpecifierUrl) as FSAbsolutePath;
}
