export interface IPrimitiveError {
    'errorCode': "INVALID_ARGUMENT";
    'errorInstanceId': string;
    'errorName': "Metadata:PrimitiveError";
    'parameters': {
        datasetRids: Array<string>;
        endTransactionRids: Array<string>;
        branchIds: Array<string>;
    };
}

export function isPrimitiveError(arg: any): arg is IPrimitiveError {
    return arg && arg.errorName === "Metadata:PrimitiveError";
}
