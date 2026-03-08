import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ParameterizableMixin } from './Parameterizable.js';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';

export interface Function<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.Parameterizable<D>, rdfine.RdfResource<D> {
  returnType: Rdfs.Class<D> | undefined;
}

export function FunctionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Function & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class FunctionClass extends ParameterizableMixin(Resource) {
    @rdfine.property.resource({ as: [RdfsClassMixin] })
    returnType: Rdfs.Class | undefined;
  }
  return FunctionClass as any
}
FunctionMixin.appliesTo = sh.Function
FunctionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Function>([ParameterizableMixin, FunctionMixin], { types: [sh.Function] }, env)
