import { access, constants } from 'node:fs/promises';

import type { FSAbsolutePath, Specifier } from './index.d.ts';
import { resolveSpecifier } from './resolveSpecifier.ts';


export function fexists(
	parentPath: FSAbsolutePath,
	specifier: Specifier,
) {
	const resolvedSpecifier = resolveSpecifier(parentPath, specifier);

	return access(
		resolvedSpecifier,
		constants.F_OK,
	)
	.then(
		() => true,
		() => false,
	);
};
