declare module "madge" {
  export interface MadgeOptions {
    readonly fileExtensions?: ReadonlyArray<string>;
    readonly tsConfig?: string;
    readonly detectiveOptions?: {
      readonly ts?: {
        readonly skipTypeImports?: boolean;
      };
    };
  }

  export interface MadgeResult {
    circular: () => ReadonlyArray<ReadonlyArray<string>>;
  }

  const madge: (path: string, options?: MadgeOptions) => Promise<MadgeResult>;

  export default madge;
}
