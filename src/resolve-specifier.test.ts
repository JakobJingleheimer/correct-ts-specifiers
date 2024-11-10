import assert from 'node:assert/strict';
import {
	describe,
	it,
} from 'node:test';

import {
	resolveSpecifier,
	resolvesToNodeModule,
} from './resolve-specifier.ts';
import path from 'node:path';


describe('Resolve specifier', () => {
	const fixturesDir = path.join(import.meta.dirname, 'fixtures/e2e');
	const catSpecifier = `${fixturesDir}/Cat.ts`;

	it('should strip an already resolved specifier (file url → path)', () => {
		const resolvedSpecifier = resolveSpecifier(
			`${fixturesDir}/test.ts`,
			`file://${catSpecifier}`,
		);

		assert.equal(resolvedSpecifier, catSpecifier);
	});

	describe('node modules', () => {
		it('should ignore a bare specifier', () => {
			const resolvedSpecifier = resolveSpecifier(
				catSpecifier,
				'animal-features',
			);

			assert.equal(
				resolvedSpecifier,
				'animal-features',
			);
		});

		it('should ignore a non-suspect bare specifier subimport', () => {
			const ogSpecifier = 'foo/bar';
			const resolvedSpecifier = resolveSpecifier(
				catSpecifier,
				ogSpecifier,
			);

			assert.equal(
				resolvedSpecifier,
				ogSpecifier,
			);
		});
	});

	describe('own modules', () => {
		it('should resolve and return a file path', () => {
			const resolvedSpecifier = resolveSpecifier(
				`${fixturesDir}/test.ts`,
				`./Cat.ts`,
			);

			assert.equal(resolvedSpecifier, catSpecifier);
		});
	});
});

describe('Resolves to a node module', () => {
	const base = '/tmp/foo/';
	const node_mod = 'node_modules/bar/whatever.ext';

	it('should signal `true` when resolved is an immediate node module', () => {
		const isNodeModule = resolvesToNodeModule(
			path.join(base, node_mod),
			path.join(base, 'main.js'),
		);

		assert.equal(isNodeModule, true);
	});

	it('should signal `true` when resolved is a relevant node module', () => {
		const isNodeModule = resolvesToNodeModule(
			path.join(base, node_mod),
			path.join(base, 'qux/zed/main.js'),
		);

		assert.equal(isNodeModule, true);
	});

	it('should signal `false` when resolved is an irrelevant node module', () => {
		const isNodeModule = resolvesToNodeModule(
			path.join(base, 'beta', node_mod),
			path.join(base, 'qux/zed/main.js'),
		);

		assert.equal(isNodeModule, false);
	});
});

describe('Get type def specifier from package.json');
