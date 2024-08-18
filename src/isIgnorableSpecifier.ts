import { extname, sep } from 'node:path';

export function isIgnorableSpecifier(specifier: string) {
	if (specifier.startsWith('node:')) return true;
	if (specifier.startsWith('data:')) return true;

	if (specifier.startsWith(sep) /* '/' */) return false;
	if (specifier.startsWith(`.${sep}`) /* './' */) return false;
	if (specifier.startsWith('file://') /* './' */) return false;
	if (extname(specifier)) return false;

	return false;
}
