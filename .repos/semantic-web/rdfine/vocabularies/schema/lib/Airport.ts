import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Airport<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
  iataCode: string | undefined;
  icaoCode: string | undefined;
}

export function AirportMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Airport & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AirportClass extends CivicStructureMixin(Resource) {
    @rdfine.property.literal()
    iataCode: string | undefined;
    @rdfine.property.literal()
    icaoCode: string | undefined;
  }
  return AirportClass as any
}
AirportMixin.appliesTo = schema.Airport
AirportMixin.createFactory = (env: RdfineEnvironment) => createFactory<Airport>([CivicStructureMixin, AirportMixin], { types: [schema.Airport] }, env)
