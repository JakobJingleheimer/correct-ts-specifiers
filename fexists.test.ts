import assert from 'node:assert';
import { basename } from 'node:path';
import { describe, it } from 'node:test';


describe('fexists', () => {
	const constants = { F_OK: null };

	async function mock__access(path: string) {
		if (basename(path).startsWith('exists.js')) return;
		else throw Object.assign(new Error('ENOENT'), { code: 'ENOENT'})
	}

	it('should return appropriately based on whether file exists', async (t) => {
		t.mock.module('node:fs/promises', {
			namedExports: {
				access: mock__access,
				constants,
			},
		});

		const { fexists } = await import('./fexists.ts');

		assert.equal(await fexists('/tmp', 'exists.js'), true);

		assert.equal(await fexists('/tmp', 'noexists.js'), false);
	})
});
