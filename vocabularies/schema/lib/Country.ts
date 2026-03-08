import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AdministrativeAreaMixin } from './AdministrativeArea.js';

export interface Country<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AdministrativeArea<D>, rdfine.RdfResource<D> {
}

export function CountryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Country & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CountryClass extends AdministrativeAreaMixin(Resource) {
  }
  return CountryClass as any
}
CountryMixin.appliesTo = schema.Country
CountryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Country>([AdministrativeAreaMixin, CountryMixin], { types: [schema.Country] }, env)
