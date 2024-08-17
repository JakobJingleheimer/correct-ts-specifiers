import { extname } from 'node:path';

import type { FSPath, Specifier } from './index.d.ts';
import { fexists } from './fexists.ts';
import { logger } from './logger.js';


export const replaceJSExtWithTSExt = async (
	filePath: FSPath,
	specifier: Specifier,
	oExt = extname(specifier) as JSExt, // Don't like this here
	rExt: TSExt | DExt = exts[oExt],
): Promise<{ replacement: FSPath | null, isType?: boolean }> => {
	let replacement = specifier.replace(oExt, rExt!);

	if (await fexists(filePath, replacement)) return { replacement, isType: false };

	const dFound = new Set();
	for (const dExt of dExts) {
		const potential = specifier.replace(oExt, dExt);
		if (await fexists(filePath, potential)) dFound.add(replacement = potential);
	}

	if (dFound.size) {
		if (dFound.size === 1) return { replacement, isType: true };

		logger('error', [
			`"${specifier}" appears to resolve to a declaration file, but multiple declaration files`,
			`were found. Cannot disambiguate between "${Array.from(dFound).join('", "')}" (skipping).`,
		].join(' '));
	}

	return { replacement: null };
};

export const exts = {
	'.cjs': '.cts',
	'.mjs': '.mts',
	'.js': '.ts',
	'.jsx': '.tsx',
} as const;
export type JSExt = keyof typeof exts;
export type TSExt = typeof exts[JSExt];

export const dExts = [
	'.d.cts',
	'.d.ts',
	'.d.mts',
] as const;
export type DExt = typeof dExts[number];
