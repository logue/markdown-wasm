/* rslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: for custom file type (such as yaml, vue etc.) reading. */

// see rslib.config.ts for details
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;

/*
// Example when you are using rsbuild-plugin-yaml, comment out below:
declare module '*.yml' {
  const content: Record<string, any>;
  export default content;
}
declare module '*.yaml' {
  const content: Record<string, any>;
  export default content;
}
*/
