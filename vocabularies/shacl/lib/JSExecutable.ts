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

export interface JSExecutable<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  jsFunctionName: string | undefined;
}

export function JSExecutableMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JSExecutable & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class JSExecutableClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.literal()
    jsFunctionName: string | undefined;
  }
  return JSExecutableClass as any
}
JSExecutableMixin.appliesTo = sh.JSExecutable
JSExecutableMixin.createFactory = (env: RdfineEnvironment) => createFactory<JSExecutable>([RdfsResourceMixin, JSExecutableMixin], { types: [sh.JSExecutable] }, env)
