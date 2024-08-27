import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
	describe,
	it,
} from 'node:test';


describe('workflow', () => {
	it('should update bad specifiers and ignore good ones', async (t) => {
		const e2eFixtPath = fileURLToPath(import.meta.resolve('./fixtures/e2e/'));

		await spawnPromisified('node', [
      '--no-warnings',
      '--experimental-strip-types',
      '--experimental-import-meta-resolve',
      '../../workflow.ts',
    ], {
			cwd: e2eFixtPath,
		});

    const result = await readFile(resolve(e2eFixtPath, 'e2e.ts'), { encoding: 'utf-8' });

    t.assert.snapshot(result);
	});
});

function spawnPromisified(...args: Parameters<typeof spawn>) {
  let stderr = '';
  let stdout = '';

  const child = spawn(...args);
  child.stderr!.setEncoding('utf8');
  child.stderr!.on('data', (data) => { stderr += data; });
  child.stdout!.setEncoding('utf8');
  child.stdout!.on('data', (data) => { stdout += data; });

  return new Promise((resolve, reject) => {
    child.on('close', (code, signal) => {
      resolve({
        code,
        signal,
        stderr,
        stdout,
      });
    });
    child.on('error', (code, signal) => {
      reject({
        code,
        signal,
        stderr,
        stdout,
      });
    });
  });
}
