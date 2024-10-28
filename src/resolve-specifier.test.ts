import assert from 'node:assert/strict';
import {
	describe,
	it,
} from 'node:test';

import { resolveSpecifier } from './resolve-specifier.ts';
import path from 'node:path';


describe.only('resolve specifier', () => {
	const fixturesDir = path.join(import.meta.dirname, 'fixtures/e2e');

	it('should find the target of a bare specifier linked via package.json "types" field', () => {
		const resolvedSpecifier = resolveSpecifier(
			`${fixturesDir}/Cat.ts`,
			'animal-features',
		);

		assert.equal(
			resolvedSpecifier,
			`${fixturesDir}/node_modules/animal-features/index.d.ts`,
		)
	});
});
