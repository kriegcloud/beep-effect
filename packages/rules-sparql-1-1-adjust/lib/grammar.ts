import type { Expression } from '@traqula/rules-sparql-1-1';
import { funcExpr2, gram as g11 } from '@traqula/rules-sparql-1-1';
import { BuiltInAdjust } from './lexer.js';

export const builtInAdjust = funcExpr2(BuiltInAdjust);

export const builtInPatch: typeof g11.builtInCall = {
  name: g11.builtInCall.name,
  impl: $ => C => $.OR2<Expression>([
    { ALT: () => $.SUBRULE(builtInAdjust) },
    { ALT: () => g11.builtInCall.impl($)(C) },
  ]),
};
