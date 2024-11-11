import assert from 'node:assert/strict';
import path from 'node:path';
import {
	describe,
	it,
} from 'node:test';

import { resolvesToNodeModule } from './resolves-to-node-module.ts';


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
