declare module "madge" {
  export interface MadgeOptions {
    readonly detectiveOptions?: {
      readonly ts?: {
        readonly skipTypeImports?: boolean;
      };
    };
    readonly fileExtensions?: ReadonlyArray<string>;
    readonly tsConfig?: string;
  }

  export interface MadgeResult {
    circular: () => ReadonlyArray<ReadonlyArray<string>>;
  }

  const madge: (path: string, options?: MadgeOptions) => Promise<MadgeResult>;

  export default madge;
}
