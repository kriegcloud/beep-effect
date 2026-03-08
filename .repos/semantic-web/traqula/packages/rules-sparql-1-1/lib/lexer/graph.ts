/* eslint-disable require-unicode-regexp */
import { LexerBuilder, createToken } from '@traqula/core';

export const named = createToken({ name: 'NamedGraph', pattern: /named/i, label: 'NAMED' });
export const default_ = createToken({ name: 'DefaultGraph', pattern: /default/i, label: 'DEFAULT' });
export const graph = createToken({ name: 'Graph', pattern: /graph/i, label: 'GRAPH' });
export const graphAll = createToken({ name: 'GraphAll', pattern: /all/i, label: 'ALL' });

export const allGraphTokens = LexerBuilder.create().add(
  named,
  default_,
  graph,
  graphAll,
);
