import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TransferActionMixin } from './TransferAction.js';

export interface GiveAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TransferAction<D>, rdfine.RdfResource<D> {
  recipient: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function GiveActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GiveAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GiveActionClass extends TransferActionMixin(Resource) {
    @rdfine.property.resource()
    recipient: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
  }
  return GiveActionClass as any
}
GiveActionMixin.appliesTo = schema.GiveAction
GiveActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<GiveAction>([TransferActionMixin, GiveActionMixin], { types: [schema.GiveAction] }, env)
