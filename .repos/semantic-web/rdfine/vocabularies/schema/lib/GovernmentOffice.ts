import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface GovernmentOffice<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function GovernmentOfficeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GovernmentOffice & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GovernmentOfficeClass extends LocalBusinessMixin(Resource) {
  }
  return GovernmentOfficeClass as any
}
GovernmentOfficeMixin.appliesTo = schema.GovernmentOffice
GovernmentOfficeMixin.createFactory = (env: RdfineEnvironment) => createFactory<GovernmentOffice>([LocalBusinessMixin, GovernmentOfficeMixin], { types: [schema.GovernmentOffice] }, env)
