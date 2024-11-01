import { execPath } from 'node:process';
import {
	describe,
	it,
} from 'node:test';

import { spawnPromisified } from '../build/spawn-promisified.ts';


describe('logger', () => {
	it('should emit non-error entries to standard out, collated by source module', async (t) => {
		const { stdout } = await spawnPromisified(execPath, [
			'--no-warnings',
			'--experimental-strip-types',
			'-e',
			`
				import { logger } from './logger.ts';

				const source1 = '/tmp/foo.js';
				logger(source1, 'log', 'maybe don’t');
				logger(source1, 'log', 'maybe not that either');

				const source2 = '/tmp/foo.js';
				logger(source2, 'log', 'still maybe don’t');
				logger(source2, 'log', 'more maybe not');
			`,
		], {
			cwd: import.meta.dirname,
		});

		t.assert.snapshot(stdout);
	});

	it('should emit error entries to standard error, collated by source module', async (t) => {
		const { stderr } = await spawnPromisified(execPath, [
			'--no-warnings',
			'--experimental-strip-types',
			'-e',
			`
				import { logger } from './logger.ts';

				const source1 = '/tmp/foo.js';
				logger(source1, 'error', 'sh*t happened');
				logger(source1, 'warn', 'maybe bad');

				const source2 = '/tmp/foo.js';
				logger(source2, 'error', 'sh*t happened');
				logger(source2, 'warn', 'maybe other bad');
			`,
		], {
			cwd: import.meta.dirname,
		});

		t.assert.snapshot(stderr);
	});
});
