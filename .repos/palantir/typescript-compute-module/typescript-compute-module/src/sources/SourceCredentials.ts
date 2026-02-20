import { Logger } from "../logger";
import * as fs from "fs";

export interface SourceCredentialsFile {
  [source: string]: {
    [credential: string]: string;
  };
}

export class SourceCredentials {
  private _sourceCredentials: SourceCredentialsFile | null = null;

  constructor(private credentialPath: string, private logger?: Logger) {}

  public getCredential(
    sourceApiName: string,
    credentialName: string
  ): string | null {
    return this.sourceCredentials[sourceApiName]?.[credentialName] ?? null;
  }

  public hasSource(sourceApiName: string): boolean {
    return this.sourceCredentials[sourceApiName] != null;
  }

  private get sourceCredentials(): SourceCredentialsFile {
    return (this._sourceCredentials ??= this.loadSourceCredentials());
  }

  private loadSourceCredentials(): SourceCredentialsFile {
    const content = JSON.parse(
      fs.readFileSync(this.credentialPath, "utf-8")
    ) as SourceCredentialsFile;
    this.logger?.log(
      `Loaded credentials: ${JSON.stringify(
        mapValues(content, obfuscateValues)
      )}`
    );
    return content;
  }
}

function mapValues<T, V>(
  object: { [id: string]: V },
  mapper: (value: V) => T
): { [id: string]: T } {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, mapper(value)])
  );
}

function obfuscateValues(obj: Record<string, string>) {
  return Object.fromEntries(Object.keys(obj).map((key) => [key, "****"]));
}
