import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TransferActionMixin } from './TransferAction.js';

export interface ReturnAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TransferAction<D>, rdfine.RdfResource<D> {
  recipient: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function ReturnActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReturnAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReturnActionClass extends TransferActionMixin(Resource) {
    @rdfine.property.resource()
    recipient: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
  }
  return ReturnActionClass as any
}
ReturnActionMixin.appliesTo = schema.ReturnAction
ReturnActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReturnAction>([TransferActionMixin, ReturnActionMixin], { types: [schema.ReturnAction] }, env)
