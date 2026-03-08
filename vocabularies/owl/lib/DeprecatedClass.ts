import '../extensions/rdfs/Class.js';
import { ClassMixinEx } from '../extensions/rdfs/Class.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';

export interface DeprecatedClass<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Class<D>, rdfine.RdfResource<D> {
}

export function DeprecatedClassMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DeprecatedClass & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class DeprecatedClassClass extends ClassMixinEx(RdfsClassMixin(Resource)) {
  }
  return DeprecatedClassClass as any
}
DeprecatedClassMixin.appliesTo = owl.DeprecatedClass
DeprecatedClassMixin.createFactory = (env: RdfineEnvironment) => createFactory<DeprecatedClass>([RdfsClassMixin, DeprecatedClassMixin], { types: [owl.DeprecatedClass] }, env)
