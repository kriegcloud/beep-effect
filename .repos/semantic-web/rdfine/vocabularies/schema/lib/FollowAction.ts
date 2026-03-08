import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InteractActionMixin } from './InteractAction.js';

export interface FollowAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InteractAction<D>, rdfine.RdfResource<D> {
  followee: Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function FollowActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FollowAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FollowActionClass extends InteractActionMixin(Resource) {
    @rdfine.property.resource()
    followee: Schema.Organization | Schema.Person | undefined;
  }
  return FollowActionClass as any
}
FollowActionMixin.appliesTo = schema.FollowAction
FollowActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<FollowAction>([InteractActionMixin, FollowActionMixin], { types: [schema.FollowAction] }, env)
