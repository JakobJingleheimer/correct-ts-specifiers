import { dirname } from 'node:path';
import { access, constants } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { FSPath, Specifier } from './index.d.ts';


export function fexists(
	parentPath: FSPath,
	specifier: Specifier,
) {
	const parentUrl = `${pathToFileURL(dirname(parentPath)).href}/`;
	
	let resolvedSpecifier: FSPath;
	
  if (URL.canParse(specifier)) {
    resolvedSpecifier = specifier;
  } else {
    // import.meta.resolve here is required because we need node's resolution algorithm to
		// incorporate the results of any hooks that may be helping, such as ones facilitating
		// tsconfig.compileOptions.paths
		// error is thrown if the specifier is not resolvable from `import.meta.resolve`
		try {
      resolvedSpecifier = fileURLToPath(import.meta.resolve(specifier, parentUrl));
		} catch {
      return false;
		}
  }

	return access(
		resolvedSpecifier,
		constants.F_OK,
	)
	.then(
		() => true,
		() => false,
	);
};
