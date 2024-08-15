import type { Api } from "@codemod.com/workflow";

import { mapImports } from 'map-imports.ts';


export async function workflow({ contexts, files }: Api) {
	await files("**/*.{cjs,mjs,js,jsx,(d.)?cts,(d.)?mts,(d.)?ts,tsx}").jsFam(async ({ astGrep }) => {
		const filepath = contexts.getFileContext().file; // absolute fs path
    await astGrep`rule:
  any:
  - kind: string_fragment
    inside:
      kind: string
      inside:
        any:
        - kind: import_statement
        - kind: export_statement
  - kind: string_fragment
    inside:
      kind: string
      inside:
        kind: arguments
        inside:
          kind: call_expression
          regex: "^require"`
		.replace(async ({ getNode }) => mapImports(filepath, getNode().text()));
  });
}
