import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface JSLibrary<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  jsLibraryURL: string | undefined;
}

export function JSLibraryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JSLibrary & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class JSLibraryClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.literal()
    jsLibraryURL: string | undefined;
  }
  return JSLibraryClass as any
}
JSLibraryMixin.appliesTo = sh.JSLibrary
JSLibraryMixin.createFactory = (env: RdfineEnvironment) => createFactory<JSLibrary>([RdfsResourceMixin, JSLibraryMixin], { types: [sh.JSLibrary] }, env)
