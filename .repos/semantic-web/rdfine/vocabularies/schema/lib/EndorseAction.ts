import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReactActionMixin } from './ReactAction.js';

export interface EndorseAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ReactAction<D>, rdfine.RdfResource<D> {
  endorsee: Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function EndorseActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EndorseAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EndorseActionClass extends ReactActionMixin(Resource) {
    @rdfine.property.resource()
    endorsee: Schema.Organization | Schema.Person | undefined;
  }
  return EndorseActionClass as any
}
EndorseActionMixin.appliesTo = schema.EndorseAction
EndorseActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<EndorseAction>([ReactActionMixin, EndorseActionMixin], { types: [schema.EndorseAction] }, env)
