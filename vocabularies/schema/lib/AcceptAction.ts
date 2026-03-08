import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AllocateActionMixin } from './AllocateAction.js';

export interface AcceptAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AllocateAction<D>, rdfine.RdfResource<D> {
}

export function AcceptActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AcceptAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AcceptActionClass extends AllocateActionMixin(Resource) {
  }
  return AcceptActionClass as any
}
AcceptActionMixin.appliesTo = schema.AcceptAction
AcceptActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<AcceptAction>([AllocateActionMixin, AcceptActionMixin], { types: [schema.AcceptAction] }, env)
