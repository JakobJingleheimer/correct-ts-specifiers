import { findPackageJSON } from 'node:module';
import { readFileSync } from 'node:fs';
import { extname, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type {
	FSAbsolutePath,
	ResolvedSpecifier,
	Specifier,
} from './index.d.ts';
import { replaceJSExtWithTSExt } from './replace-js-ext-with-ts-ext.ts';


/**
 * Determine the fully resolved module indicated by the specifier.
 * @param parentPath The module containing the provided specifier.
 * @param specifier The specifier to potentially correct.
 */
export function resolveSpecifier(
	parentPath: FSAbsolutePath | ResolvedSpecifier,
	specifier: Specifier,
): FSAbsolutePath {
	if (URL.canParse(specifier)) return specifier;

	// import.meta.resolve gives access to node's resolution algorithm, which is necessary to handle
	// a myriad of non-obvious routes, like pJson subimports and the result of any hooks that may be
	// helping, such as ones facilitating tsconfig's "paths"
	let resolvedSpecifierUrl: URL['href'];
	const parentUrl = isAbsolute(parentPath)
		? pathToFileURL(parentPath).href
		: parentPath;

	try {
		const interimResolvedUrl = import.meta.resolve(specifier, parentUrl);
		if (resolvesToNodeModule(interimResolvedUrl, parentUrl)) {
			if (extname(specifier)) { // Only check if there's potentially a subpath
				const { exports } = findPackageJSON(interimResolvedUrl, parentPath);
				if (!exports) { // Validate the extension, ex index.js → index.d.ts
					replaceJSExtWithTSExt(parentPath, interimResolvedUrl);
				}
			}

			return specifier;
		}
		return resolvedSpecifierUrl = interimResolvedUrl;
	} catch (err) {
		if (!(err instanceof Error)) throw err;

		resolvedSpecifierUrl = checkPjsonFields(parentPath, specifier, err);

		if (!resolvedSpecifierUrl) {
			Object.assign(err, { specifier, parentPath });
			throw err;
		}
	}

	if (!resolvedSpecifierUrl.startsWith('file://')) return specifier;

	return fileURLToPath(resolvedSpecifierUrl) as FSAbsolutePath;
}

export function resolvesToNodeModule(
	resolvedUrl: ResolvedSpecifier,
	parentUrl: ResolvedSpecifier,
) {
	let i = 0; // Track the last common character to determine where to check for a node module.
	for (let n = resolvedUrl.length; i < n; i++) if (resolvedUrl[i] !== parentUrl[i]) break;

	// The first segment of rest of the resolved url needs to exactly match 'node_module' (it could be
	// something like 'fake_node_modules') to be a real node module dependency.
	return resolvedUrl.slice(i).split('/')[0] === 'node_modules';
}

export function checkPjsonFields(
	parentPath: FSAbsolutePath,
	specifier: ResolvedSpecifier,
	err: Error & { code?: string },
) {
	if (err.code !== 'ERR_MODULE_NOT_FOUND') return;

	const unresolved = err.message.split('\'')[1];

	console.log({ unresolved });

	const closestPjson = findPackageJSON(unresolved, parentPath);

	console.log({ closestPjson })
	const pjson = readPJSON(closestPjson);
}

const readPJSON = (locus: ResolvedSpecifier) => JSON.parse(readFileSync(locus, 'utf8'));
