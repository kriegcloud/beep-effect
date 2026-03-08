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

export interface MultiFunction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.Parameterizable<D>, rdfine.RdfResource<D> {
}

export function MultiFunctionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MultiFunction & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class MultiFunctionClass extends ShaclParameterizableMixin(Resource) {
  }
  return MultiFunctionClass as any
}
MultiFunctionMixin.appliesTo = dash.MultiFunction
MultiFunctionMixin.createFactory = (env: RdfineEnvironment) => createFactory<MultiFunction>([ShaclParameterizableMixin, MultiFunctionMixin], { types: [dash.MultiFunction] }, env)
