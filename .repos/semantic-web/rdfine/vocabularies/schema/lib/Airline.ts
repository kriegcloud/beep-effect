import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface Airline<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
  boardingPolicy: Schema.BoardingPolicyType | undefined;
  iataCode: string | undefined;
}

export function AirlineMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Airline & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AirlineClass extends OrganizationMixin(Resource) {
    @rdfine.property()
    boardingPolicy: Schema.BoardingPolicyType | undefined;
    @rdfine.property.literal()
    iataCode: string | undefined;
  }
  return AirlineClass as any
}
AirlineMixin.appliesTo = schema.Airline
AirlineMixin.createFactory = (env: RdfineEnvironment) => createFactory<Airline>([OrganizationMixin, AirlineMixin], { types: [schema.Airline] }, env)
