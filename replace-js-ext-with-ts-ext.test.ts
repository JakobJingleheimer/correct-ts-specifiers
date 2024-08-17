import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import {
	type Mock,
	before,
	describe,
	it,
	mock,
	afterEach,
	after,
} from 'node:test';


type MockModuleContext = ReturnType<typeof mock.module>;

type DExts = typeof import('./replace-js-ext-with-ts-ext.ts').dExts;
type JSExt = import('./replace-js-ext-with-ts-ext.ts').JSExt;
type Exts = typeof import('./replace-js-ext-with-ts-ext.ts').exts;
type Logger = typeof import('./logger.ts').logger;
type ReplaceJSExtWithTSExt = typeof import('./replace-js-ext-with-ts-ext.ts').replaceJSExtWithTSExt;

describe('Correcting ts file extensions', () => {
	const originatingFilePath = resolve('./test.ts');
	let mock__log: Mock<Logger>['mock'];
	let mock__logger: MockModuleContext;
	let dExts: DExts;
	let exts: Exts;
	let replaceJSExtWithTSExt: ReplaceJSExtWithTSExt;

	before(async () => {
		const logger = mock.fn<Logger>();
		({ mock: mock__log } = logger);
		mock__logger = mock.module('./logger.js', {
			namedExports: { logger }
		});

		({
			dExts,
			exts,
			replaceJSExtWithTSExt,
		} = await import('./replace-js-ext-with-ts-ext.ts'));
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
				for (const jsExt of Object.keys(exts) as JSExt[]) {
					const output = await replaceJSExtWithTSExt(
						originatingFilePath,
						`./fixtures/rep${jsExt}`,
					);

					assert.equal(output.replacement, `./fixtures/rep${exts[jsExt]}`);
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

						const err = mock__log.calls[0].arguments[1];
						assert.match(err, /disambiguate/);
						for (const dExt of dExts) assert.match(err, new RegExp(`${base}${dExt}`));
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
			for (const jsExt of Object.keys(exts) as JSExt[]) {
				const output = await replaceJSExtWithTSExt(
					originatingFilePath,
					`./fixtures/skip${jsExt}`,
				);

				assert.equal(output.replacement, null);
				assert.equal(output.isType, undefined);
			}
		});
	});
});
