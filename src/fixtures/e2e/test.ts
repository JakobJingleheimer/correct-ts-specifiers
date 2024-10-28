import { URL } from 'node:url';

import { bar } from '@dep/bar';
import { foo } from 'foo';

import { Bird } from './Bird/index.ts';
import { Cat } from './Cat.ts';
import { Dog } from '…/Dog/index.mts';
import { baseUrl } from '#config.js';

export type { Zed } from './zed.d.ts';

// should be unchanged

export const makeLink = (path: URL) => (new URL(path, baseUrl)).href;

const nil = await import('./nil.ts');

const bird = new Bird('Tweety');
const cat = new Cat('Milo');
const dog = new Dog('Otis');

console.log('bird:', bird);
console.log('cat:', cat);
console.log('dog:', dog);
console.log('foo:', foo);
console.log('bar:', bar);
console.log('nil:', nil);
