export interface IImportError {
    'errorCode': "INVALID_ARGUMENT";
    'errorInstanceId': string;
    'errorName': "Metadata:ImportError";
    'parameters': {
        aliasName: string;
    };
}

export function isImportError(arg: any): arg is IImportError {
    return arg && arg.errorName === "Metadata:ImportError";
}
