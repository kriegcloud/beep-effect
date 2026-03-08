import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { ParameterizableMixin as ShaclParameterizableMixin } from '@rdfine/shacl/lib/Parameterizable';
import { ScriptMixin } from './Script.js';

export interface Constructor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.Parameterizable<D>, Dash.Script<D>, rdfine.RdfResource<D> {
}

export function ConstructorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Constructor & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ConstructorClass extends ScriptMixin(ShaclParameterizableMixin(Resource)) {
  }
  return ConstructorClass as any
}
ConstructorMixin.appliesTo = dash.Constructor
ConstructorMixin.createFactory = (env: RdfineEnvironment) => createFactory<Constructor>([ScriptMixin, ShaclParameterizableMixin, ConstructorMixin], { types: [dash.Constructor] }, env)
