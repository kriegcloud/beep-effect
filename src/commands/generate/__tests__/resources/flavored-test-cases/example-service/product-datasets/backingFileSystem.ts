export interface IBackingFileSystem {
    /** The name by which this file system is identified. */
    'fileSystemId': string;
    'baseUri': string;
    'configuration': { [key: string]: string };
}
