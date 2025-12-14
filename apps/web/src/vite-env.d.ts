/// <reference types="vite/client" />

// Type declarations for Vite's asset URL imports
declare module "*.css?url" {
  const src: string;
  export default src;
}

declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
