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

export interface Service<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.Parameterizable<D>, Dash.Script<D>, rdfine.RdfResource<D> {
}

export function ServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Service & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ServiceClass extends ScriptMixin(ShaclParameterizableMixin(Resource)) {
  }
  return ServiceClass as any
}
ServiceMixin.appliesTo = dash.Service
ServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Service>([ScriptMixin, ShaclParameterizableMixin, ServiceMixin], { types: [dash.Service] }, env)
