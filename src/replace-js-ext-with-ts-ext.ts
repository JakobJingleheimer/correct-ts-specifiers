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
import { isDir } from './is-dir.ts';


/**
 * Attempts to find a TypeScript-related file at the specifier's location. When there are multiple
 * potential matches, a message is logged and the specifier is skipped.
 * @param parentPath The module containing the provided specifier.
 * @param specifier The specifier to potentially correct.
 * @param rExt A file extension to try to use when making a correction.
 */
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

/**
 * Composes a new specifier with the original file extension replaced with the new (or appends the
 * new when there was no original).
 * @param specifier The specifier to update.
 * @param oExt The original/current extension.
 * @param rExt The replacement extension.
 */
const composeReplacement = (
	specifier:Specifier,
	oExt: JSExt,
	rExt: DExt | JSExt | TSExt,
): Specifier => oExt
	? specifier.replace(oExt, rExt)
	: `${specifier}${rExt}`;

/**
 * Check whether the specifier has matches for a particular group of file extensions. This validates
 * that the match does actually exist.
 * @param parentPath The module containing the provided specifier.
 * @param specifier The resolved specifier against which to check for neighbouring matches.
 * @param oExt The original extension from the specifier.
 * @param exts The file extensions to check.
 * @returns The found match, or nothing when no definitive match is found (ex there are multiple
 * matches).
 */
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
		if (found.size === 1) return { isType: exts[0].startsWith('.d'), replacement };

		logger(
			parentPath,
			'error', [
			`"${specifier}" appears to resolve to multiple files. Cannot disambiguate between`,
			`"${Array.from(found).join('", "')}"`,
			'(skipping).',
		].join(' '));
	}
}
