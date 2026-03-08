declare module 'catharsis' {
  export const parse: (input: string, options?: { jsdoc?: boolean }) => any
}

declare module 'jsdoctypeparser' {
  export const parse: (input: string, options?: { mode?: string }) => any
}

declare module 'sinon-chai-in-order'
