import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface LibrarySystem<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function LibrarySystemMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LibrarySystem & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LibrarySystemClass extends OrganizationMixin(Resource) {
  }
  return LibrarySystemClass as any
}
LibrarySystemMixin.appliesTo = schema.LibrarySystem
LibrarySystemMixin.createFactory = (env: RdfineEnvironment) => createFactory<LibrarySystem>([OrganizationMixin, LibrarySystemMixin], { types: [schema.LibrarySystem] }, env)
