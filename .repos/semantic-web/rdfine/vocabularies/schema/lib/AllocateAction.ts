import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizeActionMixin } from './OrganizeAction.js';

export interface AllocateAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.OrganizeAction<D>, rdfine.RdfResource<D> {
}

export function AllocateActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AllocateAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AllocateActionClass extends OrganizeActionMixin(Resource) {
  }
  return AllocateActionClass as any
}
AllocateActionMixin.appliesTo = schema.AllocateAction
AllocateActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<AllocateAction>([OrganizeActionMixin, AllocateActionMixin], { types: [schema.AllocateAction] }, env)
