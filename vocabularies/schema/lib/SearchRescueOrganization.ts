import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface SearchRescueOrganization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function SearchRescueOrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SearchRescueOrganization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SearchRescueOrganizationClass extends OrganizationMixin(Resource) {
  }
  return SearchRescueOrganizationClass as any
}
SearchRescueOrganizationMixin.appliesTo = schema.SearchRescueOrganization
SearchRescueOrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<SearchRescueOrganization>([OrganizationMixin, SearchRescueOrganizationMixin], { types: [schema.SearchRescueOrganization] }, env)
