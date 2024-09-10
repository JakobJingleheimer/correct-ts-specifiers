import { isBuiltin } from 'node:module';
import {
	dirname,
	extname,
	sep,
} from 'node:path';
import { pathToFileURL } from 'node:url';

import { tsExts } from './exts.ts';
import type { FSAbsolutePath } from './index.d.ts';


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

	if (specifier.startsWith(sep) /* '/' */) return false;
	if (specifier.startsWith(`.${sep}`) /* './' */) return false;
	if (specifier.startsWith('file://') /* './' */) return false;

	try {
		const resolvedSpecifier = import.meta.resolve(specifier, pathToFileURL(parentPath).href);
		if (dirname(resolvedSpecifier).includes('node_modules')) return true; // [1] is a node_module
	} catch (err) { // @ts-ignore (TS requires type of err to be unknown)
		if (!IGNORABLE_RESOLVE_ERRORS.has(err?.code)) throw err;
	}

	return false;
}

const IGNORABLE_RESOLVE_ERRORS = new Set([
	'ERR_MODULE_NOT_FOUND',
	'ERR_PACKAGE_PATH_NOT_EXPORTED', // This is a problem with the node_module itself
]);

// [1] The second argument of `import.meta.resolve()` requires `--experimental-import-meta-resolve`
