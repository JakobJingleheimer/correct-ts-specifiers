import assert from 'node:assert/strict';
import {
	type Mock,
	before,
	describe,
	it,
	mock,
	afterEach,
} from 'node:test';
import { resolve } from 'node:path';

import { dExts } from './replace-js-ext-with-ts-ext.ts';


type MockModuleContext = ReturnType<typeof mock.module>;

type Logger = typeof import('./logger.ts').logger;
type MapImports = typeof import('./map-imports.ts').mapImports;

describe('Map Imports', () => {
	const originatingFilePath = resolve('./test.ts');
	let mock__log: Mock<Logger>['mock'];
	let mock__logger: MockModuleContext;
	let mapImports: MapImports;

	before(async () => {
		const logger = mock.fn<Logger>();
		({ mock: mock__log } = logger);
		mock__logger = mock.module('./logger.js', {
			namedExports: { logger }
		});

		({ mapImports } = await import('./map-imports.ts'));
	});

	afterEach(() => {
		mock__log.resetCalls();
	});

	it('unambiguous: should skip specifier is a node builtin', async () => {
		const output = await mapImports(
			originatingFilePath,
			'node:console',
		);

		assert.equal(output.replacement, undefined);
		assert.notEqual(output.isType, true);
	});

	it('unambiguous: should skip bare specifier', async () => {
		const output = await mapImports(
			originatingFilePath,
			'foo/bar',
		);

		assert.equal(output.replacement, undefined);
		assert.notEqual(output.isType, true);
	});

	it('unambiguous: should skip namespaced specifier', async () => {
		const output = await mapImports(
			originatingFilePath,
			'@foo/bar',
		);

		assert.equal(output.replacement, undefined);
		assert.notEqual(output.isType, true);
	});

	it('quasi-ambiguous: should append TS extension when path resolves to a file', async () => {
		const specifier = './fixtures/bar';
		const output = await mapImports(
			originatingFilePath,
			specifier,
		);

		assert.equal(output.replacement, `${specifier}.js`);
		assert.notEqual(output.isType, true);
	});

	it('quasi-ambiguous: should append TS extension when path resolves to a file', async () => {
		const specifier = './fixtures/foo';
		const output = await mapImports(
			originatingFilePath,
			specifier,
		);

		assert.equal(output.replacement, `${specifier}.ts`);
		assert.notEqual(output.isType, true);
	});

	it('unambiguous: should replace ".js" → ".ts" when JS file does NOT exist & TS file DOES exist', async () => {
		const specifier = './fixtures/noexist.js';
		const output = await mapImports(
			originatingFilePath,
			specifier,
		);

		assert.equal(output.replacement, undefined);
		assert.notEqual(output.isType, true);

		const err = mock__log.calls[0].arguments[1];
		assert.match(err, /no match/i);
		assert.match(err, new RegExp(specifier));
		assert.match(err, new RegExp(originatingFilePath));
	});

	it('unambiguous: should not change the file extension when JS file DOES exist & TS file does NOT exist', async () => {
		const specifier = './fixtures/bar.js';
		const output = await mapImports(
			originatingFilePath,
			specifier,
		);

		assert.equal(output.replacement, undefined);
		assert.notEqual(output.isType, true);
	});

	it('unambiguous: should replace ".js" → ".d…" when JS file does NOT exist & a declaration file exists', async () => {
		for (const dExt of dExts) {
			const extType = dExt.split('.').pop();
			const specifierBase = `./fixtures/d/unambiguous/${extType}/index`;
			const output = await mapImports(
				originatingFilePath,
				`${specifierBase}.js`,
			);

			assert.equal(output.replacement, `${specifierBase}${dExt}`);
			assert.equal(output.isType, true);
		}
	});

	it('ambiguous: should log and skip when both a JS & a TS file exist with the same name', async () => {
		const output = await mapImports(
			originatingFilePath,
			'./fixtures/foo.js',
		);

		assert.equal(output.replacement, './fixtures/foo.ts');
		assert.notEqual(output.isType, true);
	});
});
