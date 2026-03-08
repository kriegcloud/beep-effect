import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TradeActionMixin } from './TradeAction.js';

export interface RentAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TradeAction<D>, rdfine.RdfResource<D> {
  landlord: Schema.Organization<D> | Schema.Person<D> | undefined;
  realEstateAgent: Schema.RealEstateAgent<D> | undefined;
}

export function RentActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RentAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RentActionClass extends TradeActionMixin(Resource) {
    @rdfine.property.resource()
    landlord: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    realEstateAgent: Schema.RealEstateAgent | undefined;
  }
  return RentActionClass as any
}
RentActionMixin.appliesTo = schema.RentAction
RentActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<RentAction>([TradeActionMixin, RentActionMixin], { types: [schema.RentAction] }, env)
