import { extname } from 'node:path';

import type { FSPath, Specifier } from './index.d.ts';
import { fexists } from './fexists.ts';
import { logger } from './logger.js';
import { isIgnorableSpecifier } from './isIgnorableSpecifier.ts';
import { replaceJSExtWithTSExt } from './replace-js-ext-with-ts-ext.ts';


export const mapImports = async (
	parentPath: FSPath,
	specifier: Specifier,
): Promise<{
	isType?: boolean;
	replacement?: string;
}> => {
	if (isIgnorableSpecifier(specifier)) return {};

	let { isType, replacement } = await replaceJSExtWithTSExt(parentPath, specifier);

	if (replacement) {
		if (await fexists(parentPath, specifier)) {
			logger(
				parentPath,
				'warn', [
				`Import specifier "${specifier}" contains a JS extension AND a file`,
				`with the corresponding TS extension exists. Cannot disambiguate (skipping).`,
			].join(' '));

			return { isType, replacement: specifier };
		}

		return { isType, replacement };
	}

	({ replacement } = await replaceJSExtWithTSExt(parentPath, specifier, '.d.ts'));

	if (replacement) return { isType, replacement };

	logger(
		parentPath,
		'error',
		`No matching file found for "${specifier}"`,
	);

	return {};
}
