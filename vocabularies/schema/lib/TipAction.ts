import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TradeActionMixin } from './TradeAction.js';

export interface TipAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TradeAction<D>, rdfine.RdfResource<D> {
  recipient: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function TipActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TipAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TipActionClass extends TradeActionMixin(Resource) {
    @rdfine.property.resource()
    recipient: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
  }
  return TipActionClass as any
}
TipActionMixin.appliesTo = schema.TipAction
TipActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<TipAction>([TradeActionMixin, TipActionMixin], { types: [schema.TipAction] }, env)
