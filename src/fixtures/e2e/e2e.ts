import { URL } from 'node:url';

import { foo } from 'dep1';

import { Cat } from './Cat.ts';
import { Dog } from './Dog/index.mjs';
import { baseUrl } from './config.js';
export { Zed } from './zed';

// should be unchanged

export const makeLink = (path: URL) => (new URL(path, baseUrl)).href;

const cat = new Cat('Milo');
const dog = new Dog('Otis');

console.log('cat:', cat);
console.log('dog:', dog);
console.log('foo:', foo);
