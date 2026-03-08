import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ServiceMixin } from './Service.js';

export interface BroadcastService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Service<D>, rdfine.RdfResource<D> {
  area: Schema.Place<D> | undefined;
  broadcastAffiliateOf: Schema.Organization<D> | undefined;
  broadcastDisplayName: string | undefined;
  broadcaster: Schema.Organization<D> | undefined;
  broadcastFrequency: Schema.BroadcastFrequencySpecification<D> | undefined;
  broadcastFrequencyLiteral: string | undefined;
  broadcastTimezone: string | undefined;
  callSign: string | undefined;
  hasBroadcastChannel: Schema.BroadcastChannel<D> | undefined;
  inLanguage: Schema.Language<D> | undefined;
  inLanguageLiteral: string | undefined;
  parentService: Schema.BroadcastService<D> | undefined;
  videoFormat: string | undefined;
}

export function BroadcastServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BroadcastService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BroadcastServiceClass extends ServiceMixin(Resource) {
    @rdfine.property.resource()
    area: Schema.Place | undefined;
    @rdfine.property.resource()
    broadcastAffiliateOf: Schema.Organization | undefined;
    @rdfine.property.literal()
    broadcastDisplayName: string | undefined;
    @rdfine.property.resource()
    broadcaster: Schema.Organization | undefined;
    @rdfine.property.resource()
    broadcastFrequency: Schema.BroadcastFrequencySpecification | undefined;
    @rdfine.property.literal({ path: schema.broadcastFrequency })
    broadcastFrequencyLiteral: string | undefined;
    @rdfine.property.literal()
    broadcastTimezone: string | undefined;
    @rdfine.property.literal()
    callSign: string | undefined;
    @rdfine.property.resource()
    hasBroadcastChannel: Schema.BroadcastChannel | undefined;
    @rdfine.property.resource()
    inLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.inLanguage })
    inLanguageLiteral: string | undefined;
    @rdfine.property.resource()
    parentService: Schema.BroadcastService | undefined;
    @rdfine.property.literal()
    videoFormat: string | undefined;
  }
  return BroadcastServiceClass as any
}
BroadcastServiceMixin.appliesTo = schema.BroadcastService
BroadcastServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<BroadcastService>([ServiceMixin, BroadcastServiceMixin], { types: [schema.BroadcastService] }, env)
