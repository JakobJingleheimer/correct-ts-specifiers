import { extname } from 'node:path';

import type { FSPath, Specifier } from './index.d.ts';
import { fexists } from './fexists.ts';
import { logger } from './logger.js';


export const replaceJSExtWithTSExt = async (
	parentPath: FSPath,
	specifier: Specifier,
	rExt?: TSExt | DExt,
): Promise<{
	isType?: boolean,
	replacement: FSPath | null,
}> => {
	if (!extname(specifier)) {
		specifier += '.js';

		if (await fexists(parentPath, specifier)) return { replacement: specifier, isType: false };
	}

	const oExt = extname(specifier) as JSExt;

	let replacement = composeReplacement(specifier, oExt, rExt ?? exts[oExt]);

	if (await fexists(parentPath, replacement)) return { replacement, isType: false };

	const dFound = new Set();
	for (const dExt of dExts) {
		const potential = composeReplacement(specifier, oExt, dExt);
		if (await fexists(parentPath, potential)) dFound.add(replacement = potential);
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
	'': '.js',
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

const composeReplacement = (
	specifier:Specifier,
	oExt: JSExt,
	rExt: TSExt | DExt,
) => oExt
	? specifier.replace(oExt, rExt)
	: `${specifier}${rExt}`;
