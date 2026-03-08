import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface AnimalShelter<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function AnimalShelterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AnimalShelter & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AnimalShelterClass extends LocalBusinessMixin(Resource) {
  }
  return AnimalShelterClass as any
}
AnimalShelterMixin.appliesTo = schema.AnimalShelter
AnimalShelterMixin.createFactory = (env: RdfineEnvironment) => createFactory<AnimalShelter>([LocalBusinessMixin, AnimalShelterMixin], { types: [schema.AnimalShelter] }, env)
