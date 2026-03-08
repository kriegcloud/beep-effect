import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AccommodationMixin } from './Accommodation.js';

export interface CampingPitch<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Accommodation<D>, rdfine.RdfResource<D> {
}

export function CampingPitchMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CampingPitch & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CampingPitchClass extends AccommodationMixin(Resource) {
  }
  return CampingPitchClass as any
}
CampingPitchMixin.appliesTo = schema.CampingPitch
CampingPitchMixin.createFactory = (env: RdfineEnvironment) => createFactory<CampingPitch>([AccommodationMixin, CampingPitchMixin], { types: [schema.CampingPitch] }, env)
