import { extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { tsExts } from './exts.ts';
import type { FSPath } from './index.d.ts';


export function isIgnorableSpecifier(
	parentPath: FSPath,
	specifier: string,
) {
	if (specifier.startsWith('node:')) return true;
	if (specifier.startsWith('data:')) return true;
	if (import.meta.resolve(specifier, pathToFileURL(parentPath))) return true; // [1] is a node_module

	if (specifier.startsWith(sep) /* '/' */) return false;
	if (specifier.startsWith(`.${sep}`) /* './' */) return false;
	if (specifier.startsWith('file://') /* './' */) return false;

	const ext = extname(specifier);
	if (tsExts.includes(ext)) return true;

	return false;
}

// [1] The second argument of `import.meta.resolve()` requires `--experimental-import-meta-resolve`
