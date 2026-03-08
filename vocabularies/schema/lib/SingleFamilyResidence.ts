import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HouseMixin } from './House.js';

export interface SingleFamilyResidence<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.House<D>, rdfine.RdfResource<D> {
  numberOfRooms: Schema.QuantitativeValue<D> | undefined;
  numberOfRoomsLiteral: number | undefined;
  occupancy: Schema.QuantitativeValue<D> | undefined;
}

export function SingleFamilyResidenceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SingleFamilyResidence & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SingleFamilyResidenceClass extends HouseMixin(Resource) {
    @rdfine.property.resource()
    numberOfRooms: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfRooms, type: Number })
    numberOfRoomsLiteral: number | undefined;
    @rdfine.property.resource()
    occupancy: Schema.QuantitativeValue | undefined;
  }
  return SingleFamilyResidenceClass as any
}
SingleFamilyResidenceMixin.appliesTo = schema.SingleFamilyResidence
SingleFamilyResidenceMixin.createFactory = (env: RdfineEnvironment) => createFactory<SingleFamilyResidence>([HouseMixin, SingleFamilyResidenceMixin], { types: [schema.SingleFamilyResidence] }, env)
