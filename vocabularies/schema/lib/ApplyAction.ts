import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizeActionMixin } from './OrganizeAction.js';

export interface ApplyAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.OrganizeAction<D>, rdfine.RdfResource<D> {
}

export function ApplyActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ApplyAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ApplyActionClass extends OrganizeActionMixin(Resource) {
  }
  return ApplyActionClass as any
}
ApplyActionMixin.appliesTo = schema.ApplyAction
ApplyActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ApplyAction>([OrganizeActionMixin, ApplyActionMixin], { types: [schema.ApplyAction] }, env)
