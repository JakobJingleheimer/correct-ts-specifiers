import { dirname, resolve } from 'node:path';
import { access, constants } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { FSPath, Specifier } from './index.d.ts';


export function fexists(
	parent: FSPath,
	specifier: Specifier,
) {
	const resolvedPath = URL.canParse(specifier)
		? fileURLToPath(specifier)
		: resolve(dirname(parent), specifier);

	return access(
		resolvedPath,
		constants.F_OK,
	)
	.then(
		() => true,
		() => false,
	);
};
