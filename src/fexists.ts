import { access, constants } from 'node:fs/promises';

import type {
	FSAbsolutePath,
	ResolvedSpecifier,
	Specifier,
} from './index.d.ts';
import { resolveSpecifier } from './resolve-specifier.ts';


export function fexists(
	parentPath: FSAbsolutePath,
	specifier: Specifier,
) {
	const resolvedSpecifier = resolveSpecifier(parentPath, specifier);

	return fexistsResolved(resolvedSpecifier);
};

export const fexistsResolved = (resolvedSpecifier: ResolvedSpecifier) => access(
	resolvedSpecifier,
	constants.F_OK,
)
.then(
	() => true,
	() => false,
);
