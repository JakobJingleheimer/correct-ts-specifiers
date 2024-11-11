import _get from 'lodash.get';
import { PackageJson } from 'type-fest';

import type {
	NodeError,
	Specifier,
} from './index.d.ts';
import { getNotFoundUrl } from './get-not-found-url.ts';
import { getPackageJSON } from './get-package-json.ts';


export function getTypeDefsFromPjson(
	specifier: Specifier,
	err: NodeError,
) {
	const unresolved = getNotFoundUrl(err);

	const pjson = getPackageJSON(specifier, unresolved);

	if (!pjson) return;

	const subpath = specifier.slice(specifier.indexOf('/')) || '.';

	for (const sub of [
		'types',
		'exports.types',
		`exports['${subpath}'].types`,
		'exports.typings',
		`exports['${subpath}'].typings`,
	]) {
		tryPjsonTypeDef(pjson, sub);
	}

	if (!typesPath) return;

	return import.meta.resolve(typesPath, unresolved);
}

function tryPjsonTypeDef(pjson: PackageJson, objPath: string) {

}
