type ConstLiteral = <const Literal extends string | number>(literal: Literal) => Literal;
export const constLiteral: ConstLiteral = <const Literal extends string | number>(literal: Literal) => literal;
