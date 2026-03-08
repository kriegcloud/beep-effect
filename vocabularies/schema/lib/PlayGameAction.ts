import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface PlayGameAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
  gameAvailabilityType: string | undefined;
  gameAvailabilityTypeTerm: Schema.GameAvailabilityEnumeration | undefined;
}

export function PlayGameActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PlayGameAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PlayGameActionClass extends ConsumeActionMixin(Resource) {
    @rdfine.property.literal()
    gameAvailabilityType: string | undefined;
    @rdfine.property({ path: schema.gameAvailabilityType })
    gameAvailabilityTypeTerm: Schema.GameAvailabilityEnumeration | undefined;
  }
  return PlayGameActionClass as any
}
PlayGameActionMixin.appliesTo = schema.PlayGameAction
PlayGameActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<PlayGameAction>([ConsumeActionMixin, PlayGameActionMixin], { types: [schema.PlayGameAction] }, env)
