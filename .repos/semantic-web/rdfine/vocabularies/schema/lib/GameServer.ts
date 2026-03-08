import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface GameServer<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  game: Schema.VideoGame<D> | undefined;
  playersOnline: number | undefined;
  serverStatus: Schema.GameServerStatus | undefined;
}

export function GameServerMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GameServer & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GameServerClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    game: Schema.VideoGame | undefined;
    @rdfine.property.literal({ type: Number })
    playersOnline: number | undefined;
    @rdfine.property()
    serverStatus: Schema.GameServerStatus | undefined;
  }
  return GameServerClass as any
}
GameServerMixin.appliesTo = schema.GameServer
GameServerMixin.createFactory = (env: RdfineEnvironment) => createFactory<GameServer>([IntangibleMixin, GameServerMixin], { types: [schema.GameServer] }, env)
