import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TradeActionMixin } from './TradeAction.js';

export interface DonateAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TradeAction<D>, rdfine.RdfResource<D> {
  recipient: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function DonateActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DonateAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DonateActionClass extends TradeActionMixin(Resource) {
    @rdfine.property.resource()
    recipient: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
  }
  return DonateActionClass as any
}
DonateActionMixin.appliesTo = schema.DonateAction
DonateActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DonateAction>([TradeActionMixin, DonateActionMixin], { types: [schema.DonateAction] }, env)
