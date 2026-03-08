import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface Location<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
}

export function LocationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Location & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class LocationClass extends Resource {
  }
  return LocationClass as any
}
LocationMixin.appliesTo = prov.Location
LocationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Location>([LocationMixin], { types: [prov.Location] }, env)
