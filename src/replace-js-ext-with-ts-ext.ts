import { extname } from 'node:path';

import type { FSAbsolutePath, Specifier } from './index.d.ts';
import {
	type DExt,
	type JSExt,
	type TSExt,
	extSets,
	suspectExts,
} from './exts.ts';
import { fexists } from './fexists.ts';
import { logger } from './logger.js';
import { isDir } from './isDir.ts';


export const replaceJSExtWithTSExt = async (
	parentPath: FSAbsolutePath,
	specifier: Specifier,
	rExt?: TSExt | DExt,
): Promise<{
	isType?: boolean,
	replacement: FSAbsolutePath | null,
}> => {
	if (
		specifier === '.'
		|| specifier === '..'
	) {
		specifier += '/index';
	} else if (
		specifier.endsWith('/')
		|| await isDir(parentPath, specifier)
	) {
		if (!specifier.endsWith('/')) specifier += '/';
		specifier += 'index';
	}

	if (!extname(specifier)) {
		specifier += '.js';

		if (await fexists(parentPath, specifier)) return { replacement: specifier, isType: false };
	}

	const oExt = extname(specifier) as JSExt;

	let replacement = composeReplacement(specifier, oExt, rExt ?? suspectExts[oExt]);

	if (await fexists(parentPath, replacement)) return { replacement, isType: false };

	for (const extSet of extSets) {
		const result = await checkSet(parentPath, specifier, oExt, extSet);
		if (result) return result;
	}

	return { replacement: null };
};

const composeReplacement = (
	specifier:Specifier,
	oExt: JSExt,
	rExt: DExt | JSExt | TSExt,
): Specifier => oExt
	? specifier.replace(oExt, rExt)
	: `${specifier}${rExt}`;

async function checkSet<Ext extends DExt | JSExt | TSExt>(
	parentPath: FSAbsolutePath,
	specifier: Specifier,
	oExt: JSExt,
	exts: Array<Ext>,
) {
	let replacement: Specifier;

	const found = new Set<Specifier>();
	for (const ext of exts) {
		const potential = composeReplacement(specifier, oExt, ext);
		if (await fexists(parentPath, potential)) found.add(replacement = potential);
	}

	if (found.size) {
		if (found.size === 1) return { replacement, isType: exts[0].startsWith('.d') };

		logger(
			parentPath,
			'error', [
			`"${specifier}" appears to resolve to multiple files. Cannot disambiguate between`,
			`"${Array.from(found).join('", "')}"`,
			'(skipping).',
		].join(' '));
	}
}
