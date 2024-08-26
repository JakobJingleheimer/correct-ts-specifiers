import { dirname } from 'node:path';
import { access, constants } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { FSPath, Specifier } from './index.d.ts';


export function fexists(
	parentPath: FSPath,
	specifier: Specifier,
) {
	const parentUrl = `${pathToFileURL(dirname(parentPath)).href}/`;
	const resolvedSpecifier = URL.canParse(specifier)
		? specifier
		// import.meta.resolve here is required because we need node's resolution algorithm to
		// incorporate the results of any hooks that may be helping, such as ones facilitating
		// tsconfig.compileOptions.paths
		: fileURLToPath(import.meta.resolve(specifier, parentUrl));

	return access(
		resolvedSpecifier,
		constants.F_OK,
	)
	.then(
		() => true,
		() => false,
	);
};
