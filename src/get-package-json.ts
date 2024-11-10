import { readFileSync } from 'node:fs';
import { findPackageJSON } from 'node:module';

import type { PackageJson } from 'type-fest';

import type { ResolvedSpecifier, Specifier } from './index.d.ts';


const pjsons = new Map<ResolvedSpecifier, PackageJson>();
/**
 * A memoised utility for retrieving the contents of a package.json file.
 * @param locus The fully resolved location of the package.json file to be read.
 * @returns The contents of the specified package.json
 */
export function getPackageJSON(specifier: Specifier | undefined, parentUrl: ResolvedSpecifier) {
	if (!specifier) return;

if (specifier?.includes('animal-features')) console.log('getPackageJSON::', { specifier, parentUrl })

	const locus: ResolvedSpecifier = findPackageJSON(specifier, parentUrl);
	if (pjsons.has(locus)) return pjsons.get(locus)!;

	const contents = (locus
		? JSON.parse(readFileSync(locus, 'utf8'))
		: {}) as PackageJson;

	pjsons.set(locus, contents);

	return contents;
}
