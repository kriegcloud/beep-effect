import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AchieveActionMixin } from './AchieveAction.js';

export interface WinAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AchieveAction<D>, rdfine.RdfResource<D> {
  loser: Schema.Person<D> | undefined;
}

export function WinActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WinAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WinActionClass extends AchieveActionMixin(Resource) {
    @rdfine.property.resource()
    loser: Schema.Person | undefined;
  }
  return WinActionClass as any
}
WinActionMixin.appliesTo = schema.WinAction
WinActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<WinAction>([AchieveActionMixin, WinActionMixin], { types: [schema.WinAction] }, env)
