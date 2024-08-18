import { dirname } from 'node:path';
import { access, constants } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import type { FSPath, Specifier } from './index.d.ts';


export function fexists(
	parent: FSPath,
	specifier: Specifier,
) {
	const parentPath = `${pathToFileURL(dirname(parent)).href}/`;
	const resolvedPath = URL.canParse(specifier)
		? specifier
		: import.meta.resolve((new URL(specifier, parentPath)).href);

	return access(
		resolvedPath,
		constants.F_OK,
	)
	.then(
		() => true,
		() => false,
	);
};
