import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import {
	type Mock,
	before,
	describe,
	it,
	mock,
} from 'node:test';

import type { Api } from "@codemod.com/workflow";

import { workflow } from './workflow.ts';


describe.skip('workflow', () => {
	const contexts = {
		getFileContext: () => ({ file: '/tmp/test.ts' }),
	} as any as Partial<Api['contexts']>;

	it('should', async () => {
		const result = await workflow({
			contexts,
			files,
		});
	});
});
