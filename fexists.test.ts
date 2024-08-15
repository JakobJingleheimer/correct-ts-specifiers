import assert from 'node:assert/strict';
import { describe, it } from 'node:test';


describe('fexists', () => {
	const constants = { F_OK: null };

	it('should return appropriately based on whether file exists', async (t) => {
		const mock__access = t.mock.fn(async () => {});
		t.mock.module('node:fs/promises', {
			namedExports: {
				access: mock__access,
				constants,
			},
		});

		const { fexists } = await import('./fexists.ts');

		assert.equal(await fexists('/tmp/test.ts', 'exists.js'), true);

		mock__access.mock.mockImplementationOnce(async () => {
			throw Object.assign(new Error('ENOENT'), { code: 'ENOENT'})
		});
		assert.equal(await fexists('/tmp/test.ts', 'noexists.js'), false);
	})
});
