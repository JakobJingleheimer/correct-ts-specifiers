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
		: fileURLToPath(import.meta.resolve((new URL(specifier, parentUrl)).href));

	return access(
		resolvedSpecifier,
		constants.F_OK,
	)
	.then(
		() => true,
		() => false,
	);
};
