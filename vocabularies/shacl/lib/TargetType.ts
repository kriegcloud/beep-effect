import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';
import { ParameterizableMixin } from './Parameterizable.js';

export interface TargetType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Class<D>, Sh.Parameterizable<D>, rdfine.RdfResource<D> {
}

export function TargetTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TargetType & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class TargetTypeClass extends ParameterizableMixin(RdfsClassMixin(Resource)) {
  }
  return TargetTypeClass as any
}
TargetTypeMixin.appliesTo = sh.TargetType
TargetTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<TargetType>([ParameterizableMixin, RdfsClassMixin, TargetTypeMixin], { types: [sh.TargetType] }, env)
