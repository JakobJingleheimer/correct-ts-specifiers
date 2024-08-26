import {
	dirname,
	extname,
	sep,
} from 'node:path';
import { pathToFileURL } from 'node:url';

import { tsExts } from './exts.ts';
import type { FSPath } from './index.d.ts';


export function isIgnorableSpecifier(
	parentPath: FSPath,
	specifier: string,
) {
	if (specifier.startsWith('node:')) return true;
	if (specifier.startsWith('data:')) return true;

	const ext = extname(specifier);
	// @ts-ignore not worth the trouble to get TS to realise this is okay
	if (tsExts.includes(ext)) return true;
	else if (ext) return false; // there is an extension and it's not TS → suspect

	if (specifier.startsWith(sep) /* '/' */) return false;
	if (specifier.startsWith(`.${sep}`) /* './' */) return false;
	if (specifier.startsWith('file://') /* './' */) return false;

	try {
		const resolvedSpecifier = import.meta.resolve(specifier, pathToFileURL(parentPath));
		if (dirname(resolvedSpecifier).includes('node_modules')) return true; // [1] is a node_module
	} catch (err) { // @ts-ignore (TS requires type of err to be unknown)
		if (err?.code !== 'ERR_MODULE_NOT_FOUND') throw err;
	}

	return false;
}

// [1] The second argument of `import.meta.resolve()` requires `--experimental-import-meta-resolve`
