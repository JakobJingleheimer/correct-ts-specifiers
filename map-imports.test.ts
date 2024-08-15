import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import { mapImports } from './map-imports.ts';

// import { foo } from './foo.fixture.js';
// import { bar } from './bar.fixture.js';
// import { Zed } from './zed.fixture.js';
// import 'node:console';

describe('Correcting ts file extensions', () => {
	const originatingFilePath = resolve('./test.ts');

	describe('straightforward: JS file does not exist and TS file does exist', () => {
		it('should replace the ".js" → ".ts"', async (t) => {
			const output = await mapImports(
				originatingFilePath,
				'./fixtures/foo.js',
			);

			assert.equal(output, './fixtures/foo.ts');
		});
	});

	describe('straightforward: JS file does exist and TS file does not exist', () => {
		it('should not change the file extension', async (t) => {
			const output = await mapImports(
				originatingFilePath,
				'./fixtures/bar.js',
			);

			assert.equal(output, './fixtures/bar.js');
		});
	});

	describe('ambiguous: both a JS and a TS file exist with the same name', () => {
		it('should log and skip', async (t) => {
			const output = await mapImports(
				originatingFilePath,
				'./fixtures/foo.js',
			);

			assert.equal(output, './fixtures/foo.ts');
		});
	});
});
