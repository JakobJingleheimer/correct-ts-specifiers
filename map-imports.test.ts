import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import { mapImports } from './map-imports.ts';

// import { foo } from './foo.fixture.js';
// import { bar } from './bar.fixture.js';
// import { Zed } from './zed.fixture.js';
// import 'node:console';

describe.only('Correcting ts file extensions', () => {
	const path = resolve('./fixture.ts');

	describe('simple scenario: JS file does not exist and TS file does exist', () => {
		it('should replace the ".js" → ".ts"', async (t) => {

			const output = await mapImports(
				path,
				'./foo.fixture.js',
			);

			console.log(output);
		});
	});
});
