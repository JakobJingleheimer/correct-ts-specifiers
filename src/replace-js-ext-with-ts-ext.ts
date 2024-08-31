import { extname } from 'node:path';

import type { FSAbsolutePath, Specifier } from './index.d.ts';
import {
	type DExt,
	type JSExt,
	type TSExt,
	suspectExts,
	dExts,
} from './exts.ts';
import { fexists } from './fexists.ts';
import { logger } from './logger.js';


export const replaceJSExtWithTSExt = async (
	parentPath: FSAbsolutePath,
	specifier: Specifier,
	rExt?: TSExt | DExt,
): Promise<{
	isType?: boolean,
	replacement: FSAbsolutePath | null,
}> => {
	if (!extname(specifier)) {
		specifier += '.js';

		if (await fexists(parentPath, specifier)) return { replacement: specifier, isType: false };
	}

	const oExt = extname(specifier) as JSExt;

	let replacement = composeReplacement(specifier, oExt, rExt ?? suspectExts[oExt]);

	if (await fexists(parentPath, replacement)) return { replacement, isType: false };

	const dFound = new Set();
	for (const dExt of dExts) {
		const potential = composeReplacement(specifier, oExt, dExt);
		if (await fexists(parentPath, potential)) dFound.add(replacement = potential);
	}

	if (dFound.size) {
		if (dFound.size === 1) return { replacement, isType: true };

		logger(
			parentPath,
			'error', [
			`"${specifier}" appears to resolve to a declaration file, but multiple declaration files`,
			`were found. Cannot disambiguate between "${Array.from(dFound).join('", "')}" (skipping).`,
		].join(' '));
	}

	return { replacement: null };
};

const composeReplacement = (
	specifier:Specifier,
	oExt: JSExt,
	rExt: TSExt | DExt,
) => oExt
	? specifier.replace(oExt, rExt)
	: `${specifier}${rExt}`;
