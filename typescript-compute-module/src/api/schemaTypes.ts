export interface Schema {
  functionName: string;
  inputs: Schema.FunctionInputType[]
  output: Schema.FunctionOutputType;
}

export namespace Schema {

  export interface FunctionInputType {
    name: string;
    required: boolean;
    description?: string;
    dataType: DataType;
    // Required for the query to be valid
    constraints: [];
  }

  export interface FunctionOutputType {
    type: "single";
    single: {
      dataType: DataType;
    }
  }

  export type DataType = BooleanType | IntegerType | FloatType | StringType | ListType | AnonymousCustomType | OptionalType;

  export type BooleanType = {
    type: "boolean";
    boolean: {};
  };

  export type IntegerType = {
    type: "integer";
    integer: {};
  };

  export type FloatType = {
    type: "float";
    float: {};
  };

  export type StringType = {
    type: "string";
    string: {};
  };

  export type ListType = {
    type: "list";
    list: {
      elementsType: DataType;
    };
  }

  export type AnonymousCustomType = {
      type: "anonymousCustomType";
      anonymousCustomType: {
        fields: {
          [key: string]: DataType;
        }
      };
  }

  export type OptionalType = {
    type: "optionalType";
    optionalType: {
      wrappedType: DataType;
    }
  }
}