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

export interface Parameterizable<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  labelTemplate: string | undefined;
  parameter: Sh.Parameter<D> | undefined;
}

export function ParameterizableMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Parameterizable & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class ParameterizableClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.literal()
    labelTemplate: string | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.Parameter] })
    parameter: Sh.Parameter | undefined;
  }
  return ParameterizableClass as any
}
ParameterizableMixin.appliesTo = sh.Parameterizable
ParameterizableMixin.createFactory = (env: RdfineEnvironment) => createFactory<Parameterizable>([RdfsResourceMixin, ParameterizableMixin], { types: [sh.Parameterizable] }, env)
