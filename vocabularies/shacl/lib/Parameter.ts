import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { PropertyShapeMixin } from './PropertyShape.js';

export interface Parameter<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.PropertyShape<D>, rdfine.RdfResource<D> {
  optional: boolean | undefined;
}

export function ParameterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Parameter & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class ParameterClass extends PropertyShapeMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    optional: boolean | undefined;
  }
  return ParameterClass as any
}
ParameterMixin.appliesTo = sh.Parameter
ParameterMixin.createFactory = (env: RdfineEnvironment) => createFactory<Parameter>([PropertyShapeMixin, ParameterMixin], { types: [sh.Parameter] }, env)
