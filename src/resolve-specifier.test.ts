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


describe.only('resolve specifier', () => {
	const fixturesDir = path.join(import.meta.dirname, 'fixtures/e2e');

	describe('node modules', () => {
		it('should ignore a non-suspect bare specifier', () => {
			const resolvedSpecifier = resolveSpecifier(
				`${fixturesDir}/Cat.ts`,
				'animal-features',
			);

			assert.equal(
				resolvedSpecifier,
				'animal-features',
			)
		});
	});
});

describe('resolvesToNodeModule', () => {
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