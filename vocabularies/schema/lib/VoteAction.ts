import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ChooseActionMixin } from './ChooseAction.js';

export interface VoteAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ChooseAction<D>, rdfine.RdfResource<D> {
  candidate: Schema.Person<D> | undefined;
}

export function VoteActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VoteAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VoteActionClass extends ChooseActionMixin(Resource) {
    @rdfine.property.resource()
    candidate: Schema.Person | undefined;
  }
  return VoteActionClass as any
}
VoteActionMixin.appliesTo = schema.VoteAction
VoteActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<VoteAction>([ChooseActionMixin, VoteActionMixin], { types: [schema.VoteAction] }, env)
