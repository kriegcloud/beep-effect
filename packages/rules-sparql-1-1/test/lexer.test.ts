import { describe, it } from 'vitest';
import { sparql11LexerBuilder } from '../lib/lexer/index.js';
import { pnLocalPattern } from '../lib/lexer/lexerPatterns.js';

describe('lexer', () => {
  const lexer = sparql11LexerBuilder.build();
  it('does not parse escaped URI', ({ expect }) => {
    const valid = lexer.tokenize('aair:appel\\/test');
    expect(valid).toMatchObject({ tokens: [{ tokenType: { name: 'PNameLn' }}]});
    expect(valid.errors.length).toBe(0);
    expect(valid.tokens.length).toBe(1);
    // \\/ is matched by PN_LOCAL_ESC [173]
    expect(pnLocalPattern.test('appel\\/test')).toBe(true);

    const invalid = lexer.tokenize('aair:appel\\test');
    expect(invalid.errors.length).greaterThanOrEqual(1);
    expect(invalid).toMatchObject({ tokens: [{ tokenType: { name: 'PNameLn' }}]});
    expect(new RegExp(`^(${pnLocalPattern.source})$`, 'u').test('appel\\test')).toBe(false);
  });
});
