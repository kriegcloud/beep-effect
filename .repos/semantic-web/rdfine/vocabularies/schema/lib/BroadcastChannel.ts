import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface BroadcastChannel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  broadcastChannelId: string | undefined;
  broadcastFrequency: Schema.BroadcastFrequencySpecification<D> | undefined;
  broadcastFrequencyLiteral: string | undefined;
  broadcastServiceTier: string | undefined;
  genre: string | undefined;
  genreTerm: RDF.NamedNode | undefined;
  inBroadcastLineup: Schema.CableOrSatelliteService<D> | undefined;
  providesBroadcastService: Schema.BroadcastService<D> | undefined;
}

export function BroadcastChannelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BroadcastChannel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BroadcastChannelClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal()
    broadcastChannelId: string | undefined;
    @rdfine.property.resource()
    broadcastFrequency: Schema.BroadcastFrequencySpecification | undefined;
    @rdfine.property.literal({ path: schema.broadcastFrequency })
    broadcastFrequencyLiteral: string | undefined;
    @rdfine.property.literal()
    broadcastServiceTier: string | undefined;
    @rdfine.property.literal()
    genre: string | undefined;
    @rdfine.property({ path: schema.genre })
    genreTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    inBroadcastLineup: Schema.CableOrSatelliteService | undefined;
    @rdfine.property.resource()
    providesBroadcastService: Schema.BroadcastService | undefined;
  }
  return BroadcastChannelClass as any
}
BroadcastChannelMixin.appliesTo = schema.BroadcastChannel
BroadcastChannelMixin.createFactory = (env: RdfineEnvironment) => createFactory<BroadcastChannel>([IntangibleMixin, BroadcastChannelMixin], { types: [schema.BroadcastChannel] }, env)
