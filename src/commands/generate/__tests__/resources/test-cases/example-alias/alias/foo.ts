import * as IBaz from "./baz";

export interface IFoo {
    'myField': { [key: string]: IBaz.IBaz };
}
