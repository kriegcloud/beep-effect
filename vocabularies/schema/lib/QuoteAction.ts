import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TradeActionMixin } from './TradeAction.js';

export interface QuoteAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TradeAction<D>, rdfine.RdfResource<D> {
}

export function QuoteActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<QuoteAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class QuoteActionClass extends TradeActionMixin(Resource) {
  }
  return QuoteActionClass as any
}
QuoteActionMixin.appliesTo = schema.QuoteAction
QuoteActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<QuoteAction>([TradeActionMixin, QuoteActionMixin], { types: [schema.QuoteAction] }, env)
