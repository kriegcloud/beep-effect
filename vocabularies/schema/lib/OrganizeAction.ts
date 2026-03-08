import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface OrganizeAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
}

export function OrganizeActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OrganizeAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OrganizeActionClass extends ActionMixin(Resource) {
  }
  return OrganizeActionClass as any
}
OrganizeActionMixin.appliesTo = schema.OrganizeAction
OrganizeActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<OrganizeAction>([ActionMixin, OrganizeActionMixin], { types: [schema.OrganizeAction] }, env)
