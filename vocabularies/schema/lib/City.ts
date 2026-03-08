import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AdministrativeAreaMixin } from './AdministrativeArea.js';

export interface City<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AdministrativeArea<D>, rdfine.RdfResource<D> {
}

export function CityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<City & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CityClass extends AdministrativeAreaMixin(Resource) {
  }
  return CityClass as any
}
CityMixin.appliesTo = schema.City
CityMixin.createFactory = (env: RdfineEnvironment) => createFactory<City>([AdministrativeAreaMixin, CityMixin], { types: [schema.City] }, env)
