import { extname, sep } from 'node:path';

import { tsExts } from './exts.ts';


export function isIgnorableSpecifier(specifier: string) {
	if (specifier.startsWith('node:')) return true;
	if (specifier.startsWith('data:')) return true;

	if (specifier.startsWith(sep) /* '/' */) return false;
	if (specifier.startsWith(`.${sep}`) /* './' */) return false;
	if (specifier.startsWith('file://') /* './' */) return false;

	const ext = extname(specifier);
	if (tsExts.includes(ext)) return true;

	return false;
}
