import assert from 'node:assert/strict';
import {
	type Mock,
	before,
	describe,
	it,
	mock,
	afterEach,
	after,
} from 'node:test';
import { fileURLToPath} from 'node:url';

import {
	dExts,
	jsExts,
	suspectExts,
	tsExts,
} from './exts.ts';


type MockModuleContext = ReturnType<typeof mock.module>;

type Logger = typeof import('./logger.ts').logger;
type ReplaceJSExtWithTSExt = typeof import('./replace-js-ext-with-ts-ext.ts').replaceJSExtWithTSExt;

describe('Correcting ts file extensions', () => {
	const originatingFilePath = fileURLToPath(import.meta.resolve('./test.ts'));
	let mock__log: Mock<Logger>['mock'];
	let mock__logger: MockModuleContext;
	let replaceJSExtWithTSExt: ReplaceJSExtWithTSExt;

	before(async () => {
		const logger = mock.fn<Logger>();
		({ mock: mock__log } = logger);
		mock__logger = mock.module('./logger.js', {
			namedExports: { logger }
		});

		({ replaceJSExtWithTSExt } = await import('./replace-js-ext-with-ts-ext.ts'));
	});

	afterEach(() => {
		mock__log.resetCalls();
	});

	after(() => {
		mock__logger.restore();
	});

	describe('mapped extension exists', () => {
		describe('unambiguous match', () => {
			it('should return an updated specifier', async () => {
				for (const jsExt of jsExts) {
					const output = await replaceJSExtWithTSExt(
						originatingFilePath,
						`./fixtures/rep${jsExt}`,
					);

					assert.equal(output.replacement, `./fixtures/rep${suspectExts[jsExt]}`);
					assert.equal(output.isType, false);
				}
			});
		});

		describe('declaration files', () => {
			describe('ambiguous match', () => {
				it('should skip and log error', async () => {
						const base = `./fixtures/d/ambiguous/index`;
						const output = await replaceJSExtWithTSExt(
							originatingFilePath,
							`${base}.js`,
						);

						assert.equal(output.replacement, null);

						const {
							2: msg,
						} = mock__log.calls[0].arguments;
						assert.match(msg, /disambiguate/);
						for (const dExt of dExts) assert.match(msg, new RegExp(`${base}${dExt}`));
				});
			});

			describe('unambiguous match', () => {
				it('should return an updated specifier', async () => {
					for (const dExt of dExts) {
						const base = `./fixtures/d/unambiguous/${dExt.split('.').pop()}/index`;
						const output = await replaceJSExtWithTSExt(
							originatingFilePath,
							`${base}.js`,
						);

						assert.equal(output.replacement, `${base}${dExt}`);
						assert.equal(output.isType, true);
					}
				});
			});
		});
	});

	describe('mapped extension does NOT exist', () => {
		it('should skip and log error', async () => {
			for (const jsExt of jsExts) {
				const output = await replaceJSExtWithTSExt(
					originatingFilePath,
					`./fixtures/skip${jsExt}`,
				);

				assert.equal(output.replacement, null);
				assert.equal(output.isType, undefined);
			}
		});
	});

	describe('specifier is inherently a directory', () => {
		it('should attempt to find an index file', async () => {
			for (const base of ['.', './']) {
				for (const jsExt of jsExts) {
					const output = await replaceJSExtWithTSExt(
						fileURLToPath(import.meta.resolve(`./fixtures/dir/${jsExt.slice(1)}/test.ts`)),
						base,
					);

					assert.equal(output.replacement, `${base}${base.endsWith('/') ? '' : '/'}index${jsExt}`);
					assert.equal(output.isType, false);
				}

				for (const tsExt of tsExts) {
					const output = await replaceJSExtWithTSExt(
						fileURLToPath(import.meta.resolve(`./fixtures/dir/${tsExt.slice(1)}/test.ts`)),
						base,
					);

					assert.equal(output.replacement, `${base}${base.endsWith('/') ? '' : '/'}index${tsExt}`);
					assert.equal(output.isType, false);
				}
			}
		});
	});

	describe('specifier is NOT inherently a directory', () => {
		it('should attempt to find an index file', async () => {
			for (const dExt of dExts) {
				const base = `./fixtures/d/unambiguous/${dExt.slice(3)}`;
				const output = await replaceJSExtWithTSExt(
					originatingFilePath,
					base,
				);

				assert.equal(output.replacement, `${base}/index${dExt}`);
				assert.equal(output.isType, true);
			}

			for (const jsExt of jsExts) {
				const base = `./fixtures/dir/${jsExt.slice(1)}`;
				const output = await replaceJSExtWithTSExt(
					originatingFilePath,
					base,
				);

				assert.equal(output.replacement, `${base}/index${jsExt}`);
				assert.equal(output.isType, false);
			}

			for (const tsExt of tsExts) {
				const base = `./fixtures/dir/${tsExt.slice(1)}`;
				const output = await replaceJSExtWithTSExt(
					originatingFilePath,
					base,
				);

				assert.equal(output.replacement, `${base}/index${tsExt}`);
				assert.equal(output.isType, false);
			}
		});
	});
});
