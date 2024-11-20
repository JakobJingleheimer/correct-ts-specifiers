import assert from 'node:assert/strict';
import {
	describe,
	it,
} from 'node:test';
import { fileURLToPath } from 'node:url';

import { tsExts } from './exts.ts';
import { isIgnorableSpecifier } from './is-ignorable-specifier.ts';


describe('Is ignorable specifier', () => {
	const parentPath = '/tmp/test.ts';

	it('should ignore node builtins', () => {
		assert.equal(isIgnorableSpecifier(parentPath, 'node:test'), true);
	});

	it('should ignore data URLs', () => {
		assert.equal(isIgnorableSpecifier(parentPath, 'data:,export const foo = "foo"'), true);
		assert.equal(isIgnorableSpecifier(parentPath, 'data:text/plain,export const foo = "foo"'), true);
		assert.equal(isIgnorableSpecifier(parentPath, 'data:text/plain;base64,ZXhwb3J0IGNvbnN0IGZvbyA9ICJmb28i'), true);
	});

	it('should ignore namespaced specifiers (node module)', () => {
		assert.equal(isIgnorableSpecifier(parentPath, '@foo/bar'), true);
	});

	it('should ignore TS file extensions', () => {
		for (const tsExt of tsExts) {
			assert.equal(isIgnorableSpecifier(parentPath, `tmp${tsExt}`), true);
			assert.equal(isIgnorableSpecifier(parentPath, `tmp/foo${tsExt}`), true);
			assert.equal(isIgnorableSpecifier(parentPath, `@tmp/foo${tsExt}`), true);
		}
	});

	it('should ignore node_modules', () => {
		const parentPath = fileURLToPath(import.meta.resolve('./fixtures/e2e/e2e.ts'));
		assert.equal(isIgnorableSpecifier(parentPath, 'foo'), true);
	});

	it('should handle node modules with no implementation (type-declaration-only)', () => {
		const parentPath = fileURLToPath(import.meta.resolve('./fixtures/e2e/e2e.ts')) as FSAbsolutePath;
		assert.equal(isIgnorableSpecifier(parentPath, 'animal-features'), true);
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
	});
});
