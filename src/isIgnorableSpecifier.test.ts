import assert from 'node:assert/strict';
import {
	describe,
	it,
} from 'node:test';

import { isIgnorableSpecifier } from './isIgnorableSpecifier.ts';


describe('Is ignorable specifier', () => {
	const parentPath = 'file:///tmp/test.ts';

	it('should ignore node builtins', () => {
		assert.equal(isIgnorableSpecifier(parentPath, 'node:test'), true);
	});

	it('should ignore data URLs', () => {
		assert.equal(isIgnorableSpecifier(parentPath, 'data:,export const foo = "foo"'), true);
		assert.equal(isIgnorableSpecifier(parentPath, 'data:text/plain,export const foo = "foo"'), true);
		assert.equal(isIgnorableSpecifier(parentPath, 'data:text/plain;base64,ZXhwb3J0IGNvbnN0IGZvbyA9ICJmb28i'), true);
	});

	it('should NOT ignore absolute paths', () => {
		assert.equal(isIgnorableSpecifier(parentPath, '/tmp'), false);
		assert.equal(isIgnorableSpecifier(parentPath, '/tmp-foo_1'), false);
	});

	it('should NOT ignore relative paths', () => {
		assert.equal(isIgnorableSpecifier(parentPath, './tmp'), false);
		assert.equal(isIgnorableSpecifier(parentPath, './tmp-foo_1'), false);
	});

	it('should NOT ignore fully-qualified URLs', () => {
		assert.equal(isIgnorableSpecifier(parentPath, 'file:///tmp/foo.js'), false);
	});

	it('should NOT ignore anything with a file extension', () => {
		assert.equal(isIgnorableSpecifier(parentPath, 'tmp.js'), false);
		assert.equal(isIgnorableSpecifier(parentPath, 'tmp/foo.js'), false);
		assert.equal(isIgnorableSpecifier(parentPath, '@tmp/foo.js'), false);
	});

	it('should NOT ignore possibly unsuffixed paths', () => {
		assert.equal(isIgnorableSpecifier(parentPath, 'tmp-zed_1'), false);
		assert.equal(isIgnorableSpecifier(parentPath, 'tmp-zed/foo_1'), false);
		assert.equal(isIgnorableSpecifier(parentPath, '@tmp-zed/foo_1'), false);
	});
});
