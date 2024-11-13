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


describe('Get type defs from package.json', () => {
	let getTypeDefsFromPjson;
	/** @type {MockFunctionContext<NoOpFunction>} */
	let mock_getPackageJSON;

	before(async () => {
		const getPackageJSON = mock.fn();
		mock_getPackageJSON = getPackageJSON.mock;
		mock.module('./get-package-json.ts', { namedExports: { getPackageJSON }})
	});
})
