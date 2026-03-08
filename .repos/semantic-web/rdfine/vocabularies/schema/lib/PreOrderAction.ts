import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TradeActionMixin } from './TradeAction.js';

export interface PreOrderAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TradeAction<D>, rdfine.RdfResource<D> {
}

export function PreOrderActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PreOrderAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PreOrderActionClass extends TradeActionMixin(Resource) {
  }
  return PreOrderActionClass as any
}
PreOrderActionMixin.appliesTo = schema.PreOrderAction
PreOrderActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<PreOrderAction>([TradeActionMixin, PreOrderActionMixin], { types: [schema.PreOrderAction] }, env)
