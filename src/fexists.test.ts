import assert from 'node:assert/strict';
import {
	type Mock,
	after,
	afterEach,
	before,
	describe,
	it,
	mock,
} from 'node:test';
import { fileURLToPath } from 'node:url';


type FSAccess = typeof import('node:fs/promises').access;
type FExists = typeof import('./fexists.ts').fexists;
type MockModuleContext = ReturnType<typeof mock.module>;

const RESOLVED_SPECIFIER_ERR = 'Resolved specifier did not match expected';

describe('fexists', () => {
	const parentPath = '/tmp/test.ts';
	const constants = { F_OK: null };

	let mock__access: Mock<FSAccess>['mock'];
	let mock__fs: MockModuleContext;

	before(() => {
		const access = mock.fn<FSAccess>();
		({ mock: mock__access } = access);
		mock__fs = mock.module('node:fs/promises', {
			namedExports: {
				access,
				constants,
			},
		});
	});

	after(() => {
		mock__fs.restore();
	});

	describe('when the file exists', () => {
		let fexists: FExists;

		before(async () => {
			mock__access.mockImplementation(async function MOCK_access() {});

			({ fexists } = await import('./fexists.ts'));
		});

		afterEach(() => {
			mock__access.resetCalls();
		});

		after(() => {
			mock__fs.restore();
		});

		it('should return `true` for a bare specifier', async () => {
			const parentUrl = fileURLToPath(import.meta.resolve('./fixtures/e2e/test.js'));

			assert.equal(await fexists(parentUrl, 'foo'), true);
			assert.equal(
				mock__access.calls[0].arguments[0],
				fileURLToPath(import.meta.resolve('./fixtures/e2e/node_modules/foo/foo.js')),
				RESOLVED_SPECIFIER_ERR,
			);
		});

		it('should return `true` for a relative specifier', async () => {
			assert.equal(await fexists(parentPath, 'exists.js'), true);
			assert.equal(
				mock__access.calls[0].arguments[0],
				'/tmp/exists.js',
				RESOLVED_SPECIFIER_ERR,
			);
		});

		it('should return `true` for specifier with a query parameter', async () => {
			assert.equal(await fexists(parentPath, 'exists.js?v=1'), true);
			assert.equal(
				mock__access.calls[0].arguments[0],
				'/tmp/exists.js',
				RESOLVED_SPECIFIER_ERR,
			);
		});

		it('should return `true` for an absolute specifier', async () => {
			assert.equal(await fexists(parentPath, '/tmp/foo/exists.js'), true);
			assert.equal(
				mock__access.calls[0].arguments[0],
				'/tmp/foo/exists.js',
				RESOLVED_SPECIFIER_ERR,
			);
		});

		it('should return `true` for a URL', async () => {
			assert.equal(await fexists(parentPath, 'file://localhost/foo/exists.js'), true);
			assert.equal(
				mock__access.calls[0].arguments[0],
				'file://localhost/foo/exists.js',
				RESOLVED_SPECIFIER_ERR,
			);
		});
	});

	describe('when the file does NOT exists', () => {
		let fexists: FExists;

		before(async () => {
			mock__access.mockImplementation(async function MOCK_access() {
				throw Object.assign(new Error('ENOENT'), { code: 'ENOENT'});
			});

			({ fexists } = await import('./fexists.ts'));
		});

		afterEach(() => {
			mock__access.resetCalls();
		});

		after(() => {
			mock__fs.restore();
		});

		it('should return `false` for a relative specifier', async () => {
			assert.equal(await fexists(parentPath, 'noexists.js'), false);
			assert.equal(
				mock__access.calls[0].arguments[0],
				'/tmp/noexists.js',
				RESOLVED_SPECIFIER_ERR,
			);
		});

		it('should return `false` for a relative specifier', async () => {
			assert.equal(await fexists(parentPath, 'noexists.js?v=1'), false);
			assert.equal(
				mock__access.calls[0].arguments[0],
				'/tmp/noexists.js',
				RESOLVED_SPECIFIER_ERR,
			);
		});

		it('should return `false` for an absolute specifier', async () => {
			assert.equal(await fexists(parentPath, '/tmp/foo/noexists.js'), false);
			assert.equal(
				mock__access.calls[0].arguments[0],
				'/tmp/foo/noexists.js',
				RESOLVED_SPECIFIER_ERR,
			);
		});

		it('should return `false` for a URL specifier', async () => {
			assert.equal(await fexists(parentPath, 'file://localhost/foo/noexists.js'), false);
			assert.equal(
				mock__access.calls[0].arguments[0],
				'file://localhost/foo/noexists.js',
				RESOLVED_SPECIFIER_ERR,
			);
		});
	});
});
