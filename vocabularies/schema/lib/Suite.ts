import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AccommodationMixin } from './Accommodation.js';

export interface Suite<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Accommodation<D>, rdfine.RdfResource<D> {
  bed: Schema.BedDetails<D> | undefined;
  bedLiteral: string | undefined;
  numberOfRooms: Schema.QuantitativeValue<D> | undefined;
  numberOfRoomsLiteral: number | undefined;
  occupancy: Schema.QuantitativeValue<D> | undefined;
}

export function SuiteMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Suite & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SuiteClass extends AccommodationMixin(Resource) {
    @rdfine.property.resource()
    bed: Schema.BedDetails | undefined;
    @rdfine.property.literal({ path: schema.bed })
    bedLiteral: string | undefined;
    @rdfine.property.resource()
    numberOfRooms: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfRooms, type: Number })
    numberOfRoomsLiteral: number | undefined;
    @rdfine.property.resource()
    occupancy: Schema.QuantitativeValue | undefined;
  }
  return SuiteClass as any
}
SuiteMixin.appliesTo = schema.Suite
SuiteMixin.createFactory = (env: RdfineEnvironment) => createFactory<Suite>([AccommodationMixin, SuiteMixin], { types: [schema.Suite] }, env)
