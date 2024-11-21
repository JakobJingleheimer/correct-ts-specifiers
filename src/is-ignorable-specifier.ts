import { isBuiltin } from 'node:module';
import {
	extname,
	sep,
} from 'node:path';
import { pathToFileURL } from 'node:url';

import { tsExts } from './exts.ts';
import type { FSAbsolutePath, NodeError, ResolvedSpecifier, Specifier } from './index.d.ts';
import { resolvesToNodeModule } from './resolves-to-node-module.ts';
import { getNotFoundUrl } from './get-not-found-url.ts';


/**
 * Whether the specifier can be completely ignored.
 * @param parentPath The module containing the provided specifier
 * @param specifier The specifier to check.
 */
export function isIgnorableSpecifier(
	parentPath: FSAbsolutePath,
	specifier: string,
) {
	if (isBuiltin(specifier)) return true;
	if (specifier.startsWith('data:')) return true;

	const ext = extname(specifier);
	// @ts-ignore not worth the trouble to get TS to realise this is okay
	if (tsExts.includes(ext)) return true;
	else if (ext) return false; // there is an extension and it's not TS → suspect

	if (specifier[0] === '@') return true; // namespaced node module

	if (specifier[0] === sep /* '/' */) return false;
	if (specifier.startsWith(`.${sep}`) /* './' */) return false;
	if (specifier.startsWith('file://')) return false;

	let resolvedSpecifier: ResolvedSpecifier;
	try {
		resolvedSpecifier = import.meta.resolve(specifier, pathToFileURL(parentPath).href) as ResolvedSpecifier; // [1]
	} catch (err) {
		if (
			!(err instanceof Error)
			|| !IGNORABLE_RESOLVE_ERRORS.has((err as NodeError).code!)
		) throw err;

		resolvedSpecifier = getNotFoundUrl(err);
	} finally {
		if (resolvesToNodeModule(resolvedSpecifier!, parentPath)) return true;
	}

	return false;
}

const IGNORABLE_RESOLVE_ERRORS = new Set([
	'ERR_MODULE_NOT_FOUND',
	'ERR_PACKAGE_PATH_NOT_EXPORTED', // This is a problem with the node_module itself
]);

// [1] The second argument of `import.meta.resolve()` requires `--experimental-import-meta-resolve`
