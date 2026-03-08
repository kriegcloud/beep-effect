import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AdministrativeAreaMixin } from './AdministrativeArea.js';

export interface SchoolDistrict<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AdministrativeArea<D>, rdfine.RdfResource<D> {
}

export function SchoolDistrictMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SchoolDistrict & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SchoolDistrictClass extends AdministrativeAreaMixin(Resource) {
  }
  return SchoolDistrictClass as any
}
SchoolDistrictMixin.appliesTo = schema.SchoolDistrict
SchoolDistrictMixin.createFactory = (env: RdfineEnvironment) => createFactory<SchoolDistrict>([AdministrativeAreaMixin, SchoolDistrictMixin], { types: [schema.SchoolDistrict] }, env)
