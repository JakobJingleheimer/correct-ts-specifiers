import type { FSPath, Specifier } from './index.d.ts';
import { fexists } from './fexists.ts';
import { logger } from './logger.js';
import { replaceJSExtWithTSExt } from './replace-js-ext-with-ts-ext.ts';


export const mapImports = async (
	filePath: FSPath,
	specifier: Specifier,
): Promise<{
	isType?: boolean;
	replacement?: string;
}> => {
	if (bareSpecifier.test(specifier)) return {};

	let { isType, replacement} = await replaceJSExtWithTSExt(filePath, specifier);

	if (replacement) {
		if (await fexists(filePath, specifier)) {
			logger('warn', [
				`Import specifier "${specifier}" within ${filePath} contains a JS extension AND a file`,
				`with the corresponding TS extension exists. Cannot disambiguate (skipping).`,
			].join(' '));

			return {};
		}

		return { isType, replacement };
	}

	({ replacement } = await replaceJSExtWithTSExt(filePath, specifier, undefined, '.d.ts'));

	if (replacement) return { isType, replacement };

	logger('error', `No matching file found for "${specifier}" within ${filePath}`);

	return {};
}

const bareSpecifier = /^[\w:/@]+$/;
