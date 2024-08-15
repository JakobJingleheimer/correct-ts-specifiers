import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import {
	type JSExt,
	exts,
	dExts,
	replaceJSExtWithTSExt,
} from './replace-js-ext-with-ts-ext.ts';

// import { foo } from './fixture/foo.js';
// import { bar } from './fixture/bar.js';
// import { Zed } from './fixture/zed.js';
// import 'node:console';

describe.only('Correcting ts file extensions', () => {
	const originatingFilePath = resolve('./test.ts');

	describe('mapped extension exists', () => {
		it('should return an updated specifier', async () => {
			for (const jsExt of Object.keys(exts) as JSExt[]) {
				const output = await replaceJSExtWithTSExt(
					originatingFilePath,
					`./fixtures/rep${jsExt}`,
				);

				assert.equal(output, `./fixtures/rep${exts[jsExt]}`);
			}
		});

		describe.todo('declaration files', () => {
			it('should return an updated specifier', async () => {
				for (const dExt of dExts) {
					const output = await replaceJSExtWithTSExt(
						originatingFilePath,
						`./fixtures/rep-d.js`,
					);

					assert.equal(output, `./fixtures/rep-d${dExt}`);
				}
			});
		});
	});

	describe('mapped extension does NOT exist', () => {
		it('should skip', async () => {
			for (const jsExt of Object.keys(exts) as JSExt[]) {
				const output = await replaceJSExtWithTSExt(
					originatingFilePath,
					`./fixtures/skip${jsExt}`,
				);

				assert.equal(output, null);
			}
		});
	});
});
