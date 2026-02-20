export interface IBackingFileSystem {
    /** The name by which this file system is identified. */
    readonly 'fileSystemId': string;
    readonly 'baseUri': string;
    readonly 'configuration': { readonly [key: string]: string };
}
