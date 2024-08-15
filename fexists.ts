import { resolve } from 'node:path';
import { access, constants } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { FSPath, Specifier } from './index.d.ts';


export function fexists(
	parent: FSPath,
	specifier: Specifier,
) {
	const path = URL.canParse(specifier)
		? fileURLToPath(specifier)
		: specifier;

	return access(
		resolve(parent, path),
		constants.F_OK,
	)
	.then(
		() => true,
		() => false,
	);
};
