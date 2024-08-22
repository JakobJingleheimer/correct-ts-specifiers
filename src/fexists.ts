import { dirname, resolve } from "node:path";
import { access, constants } from "node:fs/promises";

import type { FSPath, Specifier } from "./index.d.ts";

export function fexists(parentPath: FSPath, specifier: Specifier) {
  const resolvedSpecifier = resolve(dirname(parentPath), specifier);

  return access(resolvedSpecifier, constants.F_OK).then(
    () => true,
    () => false,
  );
}
