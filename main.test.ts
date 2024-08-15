import { readFile } from 'fs/promises';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import transform from './main.ts';


describe('Correcting ts file extensions', () => {
	const path = resolve('./main.fixture.ts');

	describe('simple scenario: JS file does not exist and TS file does exist', () => {
		it('should replace the ".js" → ".ts"', async (t) => {
			const source = `${await readFile(path)}`;

			const output = await transform({
				path,
				source,
			});

			console.log(output);
		});
	});
});
