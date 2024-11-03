import { readFileSync } from 'node:fs';
import { findPackageJSON } from 'node:module';

import type { JsonObject } from 'type-fest';

import type { ResolvedSpecifier, Specifier } from './index.d.ts';


const pjsons = new Map<ResolvedSpecifier, JsonObject>();
/**
 * A memoised utility for retrieving the contents of a package.json file.
 * @param locus The fully resolved location of the package.json file to be read.
 * @returns The contents of the specified package.json
 */
export function getPackageJSON(specifier: Specifier, parentUrl: ResolvedSpecifier) {
	const locus: ResolvedSpecifier = findPackageJSON(specifier, parentUrl);
	if (pjsons.has(locus)) return pjsons.get(locus)!;

	const contents = (locus
		? JSON.parse(readFileSync(locus, 'utf8'))
		: {}) as JsonObject;

	pjsons.set(locus, contents);

	return contents;
}
