import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
	describe,
	it,
} from 'node:test';


describe('workflow', () => {
	it('should', async () => {
		const e2eFixtPath = fileURLToPath(import.meta.resolve('./fixtures/e2e/'));

		await spawnPromisified('codemod', ['../../workflow.ts'], {
			cwd: e2eFixtPath,
		});
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
