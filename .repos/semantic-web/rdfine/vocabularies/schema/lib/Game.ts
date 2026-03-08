import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Game<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  characterAttribute: Schema.Thing<D> | undefined;
  gameItem: Schema.Thing<D> | undefined;
  gameLocation: Schema.Place<D> | Schema.PostalAddress<D> | undefined;
  numberOfPlayers: Schema.QuantitativeValue<D> | undefined;
  quest: Schema.Thing<D> | undefined;
}

export function GameMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Game & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GameClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    characterAttribute: Schema.Thing | undefined;
    @rdfine.property.resource()
    gameItem: Schema.Thing | undefined;
    @rdfine.property.resource()
    gameLocation: Schema.Place | Schema.PostalAddress | undefined;
    @rdfine.property.resource()
    numberOfPlayers: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    quest: Schema.Thing | undefined;
  }
  return GameClass as any
}
GameMixin.appliesTo = schema.Game
GameMixin.createFactory = (env: RdfineEnvironment) => createFactory<Game>([CreativeWorkMixin, GameMixin], { types: [schema.Game] }, env)
