import { describe, it, expectTypeOf } from 'vitest';
import type { ParserRule } from '../../lib/index.js';
import { ParserBuilder } from '../../lib/index.js';

interface Context {
  world: 'hello';
}

const RuleA: ParserRule<Context, 'apple', 'apple'> = {
  name: 'apple',
  impl: () => () => 'apple',
};
const RuleB: ParserRule<Context, 'banana', 'banana'> = {
  name: 'banana',
  impl: () => () => 'banana',
};
const RuleC: ParserRule<Context, 'coconut', 'coconut'> = {
  name: 'coconut',
  impl: () => () => 'coconut',
};

describe('parserBuilder', () => {
  describe('types', () => {
    it('builder constructor', () => {
      expectTypeOf(ParserBuilder.create(<const> [ RuleA ]))
        .branded.toEqualTypeOf<ParserBuilder<Context, 'apple', { apple: typeof RuleA }>>();
      expectTypeOf(ParserBuilder.create(<const> [ RuleB ]))
        .branded.toEqualTypeOf<ParserBuilder<Context, 'banana', { banana: typeof RuleB }>>();
      expectTypeOf(ParserBuilder.create(<const> [ RuleA, RuleB ]))
        .branded
        .toEqualTypeOf<ParserBuilder<Context, 'apple' | 'banana', { apple: typeof RuleA; banana: typeof RuleB }>>();

      // AddRule
      expectTypeOf(ParserBuilder.create(<const> [ RuleA, RuleB ]).addRule(RuleC))
        .branded.toEqualTypeOf<ParserBuilder<
        Context,
'apple' | 'banana' | 'coconut',
{ apple: typeof RuleA; banana: typeof RuleB; coconut: typeof RuleC }
      >>();

      // Merge
      expectTypeOf(
        ParserBuilder.create(<const> [ RuleA ])
          .merge(ParserBuilder.create(<const> [ RuleB ]), <const> []),
      ).branded
        .toEqualTypeOf<ParserBuilder<Context, 'apple' | 'banana', { apple: typeof RuleA; banana: typeof RuleB }>>();

      expectTypeOf(
        ParserBuilder.create(<const> [ RuleA, RuleB ])
          .merge(ParserBuilder.create(<const> [ RuleB, RuleC ]), <const> []),
      ).branded
        .toEqualTypeOf<ParserBuilder<
          Context,
'apple' | 'banana' | 'coconut',
{ apple: typeof RuleA; banana: typeof RuleB; coconut: typeof RuleC }
      >>();
    });
  });
});
