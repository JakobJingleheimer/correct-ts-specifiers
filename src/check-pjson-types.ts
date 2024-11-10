import type {
	NodeError,
	Specifier,
} from './index.d.ts';
import { getNotFoundUrl } from './get-not-found-url.ts';
import { getPackageJSON } from './get-package-json.ts';


export function checkPjsonFields(
	specifier: Specifier,
	err: NodeError,
) {
	if (err.code !== 'ERR_MODULE_NOT_FOUND') return;

	const unresolved = getNotFoundUrl(err);

	const pjson = getPackageJSON(specifier, unresolved);

	const typesPath = (
		   pjson?.types
		|| pjson?.exports?.types
		|| pjson?.exports?.typings
	);

	if (!typesPath) return;

	return import.meta.resolve(typesPath, unresolved);
}
