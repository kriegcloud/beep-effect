import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AdministrativeAreaMixin } from './AdministrativeArea.js';

export interface State<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AdministrativeArea<D>, rdfine.RdfResource<D> {
}

export function StateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<State & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class StateClass extends AdministrativeAreaMixin(Resource) {
  }
  return StateClass as any
}
StateMixin.appliesTo = schema.State
StateMixin.createFactory = (env: RdfineEnvironment) => createFactory<State>([AdministrativeAreaMixin, StateMixin], { types: [schema.State] }, env)
