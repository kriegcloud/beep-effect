import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AllocateActionMixin } from './AllocateAction.js';

export interface RejectAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AllocateAction<D>, rdfine.RdfResource<D> {
}

export function RejectActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RejectAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RejectActionClass extends AllocateActionMixin(Resource) {
  }
  return RejectActionClass as any
}
RejectActionMixin.appliesTo = schema.RejectAction
RejectActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<RejectAction>([AllocateActionMixin, RejectActionMixin], { types: [schema.RejectAction] }, env)
