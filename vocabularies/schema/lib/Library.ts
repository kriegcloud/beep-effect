import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface Library<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function LibraryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Library & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LibraryClass extends LocalBusinessMixin(Resource) {
  }
  return LibraryClass as any
}
LibraryMixin.appliesTo = schema.Library
LibraryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Library>([LocalBusinessMixin, LibraryMixin], { types: [schema.Library] }, env)
