import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface ArchiveOrganization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
  archiveHeld: Schema.ArchiveComponent<D> | undefined;
}

export function ArchiveOrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ArchiveOrganization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ArchiveOrganizationClass extends LocalBusinessMixin(Resource) {
    @rdfine.property.resource()
    archiveHeld: Schema.ArchiveComponent | undefined;
  }
  return ArchiveOrganizationClass as any
}
ArchiveOrganizationMixin.appliesTo = schema.ArchiveOrganization
ArchiveOrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<ArchiveOrganization>([LocalBusinessMixin, ArchiveOrganizationMixin], { types: [schema.ArchiveOrganization] }, env)
