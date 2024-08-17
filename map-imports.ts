import type { FSPath, Specifier } from './index.d.ts';
import { fexists } from './fexists.ts';
import { logger } from './logger.js';
import { replaceJSExtWithTSExt } from './replace-js-ext-with-ts-ext.ts';


export const mapImports = async (
	filePath: FSPath,
	specifier: Specifier,
) => {
	console.log({
		filePath,
		specifier
	});

	let replacement = await replaceJSExtWithTSExt(filePath, specifier);

	console.log('replacement', replacement);

	if (replacement) {
		console.log('replacement found', replacement);

		if (await fexists(filePath, specifier)) {
			logger('warn', [
				`Import specifier '${specifier}' within ${filePath} contains a JS extension AND a file`,
				`with the corresponding TS extension exists. Cannot disambiguate (skipping).`,
			].join(' '));

			return;
		}

		console.log('using replacement', replacement);

		return replacement;
	}

	replacement = await replaceJSExtWithTSExt(filePath, specifier, undefined, '.d.ts');

	if (replacement) return replacement;

	logger('error', `Could not figure out what to do for '${specifier}' within ${filePath}`);

	return;
}
