import { extname } from 'node:path';

import type { FSPath, Specifier } from './index.d.ts';
import { fexists } from './fexists.ts';


export const replaceJSExtWithTSExt = async (
	filePath: FSPath,
	specifier: Specifier,
	oExt = extname(specifier) as JSExts, // Don't like this here
	rExt: TSExts | '.d.ts' = exts[oExt],
) => {
	const specifierWithTSExt = specifier.replace(oExt, rExt!);

	if (await fexists(filePath, specifierWithTSExt)) return specifierWithTSExt;

	return null;
};

const exts = {
	'.cjs': '.cts',
	'.mjs': '.mts',
	'.js': '.ts',
	'.jsx': '.tsx',
} as const;
type JSExts = keyof typeof exts;
type TSExts = typeof exts[JSExts];
