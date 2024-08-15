import { extname } from 'node:path';

import type { FSPath, Specifier } from './index.d.ts';
import { fexists } from './fexists.ts';


export const replaceJSExtWithTSExt = async (
	filePath: FSPath,
	specifier: Specifier,
	oExt = extname(specifier) as JSExt, // Don't like this here
	rExt: TSExt | DExt = exts[oExt],
) => {
	let specifierWithTSExt = specifier.replace(oExt, rExt!);

	if (await fexists(filePath, specifierWithTSExt)) return specifierWithTSExt;

	for (const dExt of dExts) {
		specifierWithTSExt = specifier.replace(oExt, dExt);
		if (await fexists(filePath, specifierWithTSExt)) return specifierWithTSExt;
	}

	return null;
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
