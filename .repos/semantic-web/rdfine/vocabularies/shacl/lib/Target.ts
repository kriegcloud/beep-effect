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

export interface Target<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function TargetMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Target & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class TargetClass extends RdfsResourceMixin(Resource) {
  }
  return TargetClass as any
}
TargetMixin.appliesTo = sh.Target
TargetMixin.createFactory = (env: RdfineEnvironment) => createFactory<Target>([RdfsResourceMixin, TargetMixin], { types: [sh.Target] }, env)
