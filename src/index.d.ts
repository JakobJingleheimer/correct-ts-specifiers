/**
 * @example '/foo/bar.js'
 */
export type FSPath = string;
/**
 * @example 'file:///foo/bar.js'
 */
export type ResolvedSpecifier = URL['href'];
/**
 * @example './bar.js'
 */
export type Specifier = URL['pathname'] | ResolvedSpecifier;
