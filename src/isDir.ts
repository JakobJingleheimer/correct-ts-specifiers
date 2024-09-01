import { lstat } from 'fs/promises';

import type { FSAbsolutePath, Specifier } from './index.d.ts';
import { resolveSpecifier } from './resolveSpecifier.ts';


export async function isDir(
	parentPath: FSAbsolutePath,
	specifier: Specifier,
) {
	const resolvedSpecifier = resolveSpecifier(parentPath, specifier);

	try {
		const stat = await lstat(resolvedSpecifier);
		return stat.isDirectory();
	} catch (err) {
		return null;
	}
}
