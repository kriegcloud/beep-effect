import * as fs from "fs";

export interface ResourceAliasesFile {
  [alias: string]: Resource;
}

export interface Resource {
  rid: string;
  branch?: string;
}

export class ResourceAliases {
  private _resourceAliases: ResourceAliasesFile | null = null;

  constructor(private resourceAliasesPath: string) {}

  public getAlias(alias: string): Resource | null {
    return this.resourceAliases?.[alias] ?? null;
  }

  private get resourceAliases(): ResourceAliasesFile {
    return (this._resourceAliases ??= JSON.parse(
      fs.readFileSync(this.resourceAliasesPath, "utf-8")
    ));
  }
}
