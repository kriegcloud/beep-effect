import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface MediaObject<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  associatedArticle: Schema.NewsArticle<D> | undefined;
  bitrate: string | undefined;
  contentSize: string | undefined;
  contentUrl: RDF.NamedNode | undefined;
  duration: Schema.Duration<D> | undefined;
  embedUrl: RDF.NamedNode | undefined;
  encodesCreativeWork: Schema.CreativeWork<D> | undefined;
  encodingFormat: string | undefined;
  encodingFormatTerm: RDF.NamedNode | undefined;
  endTime: Date | undefined;
  height: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
  ineligibleRegion: Schema.GeoShape<D> | Schema.Place<D> | undefined;
  ineligibleRegionLiteral: string | undefined;
  interpretedAsClaim: Schema.Claim<D> | undefined;
  playerType: string | undefined;
  productionCompany: Schema.Organization<D> | undefined;
  regionsAllowed: Schema.Place<D> | undefined;
  requiresSubscription: Schema.MediaSubscription<D> | undefined;
  requiresSubscriptionLiteral: boolean | undefined;
  'sha256': string | undefined;
  startTime: Date | undefined;
  uploadDate: Date | undefined;
  width: Schema.Distance<D> | Schema.QuantitativeValue<D> | undefined;
}

export function MediaObjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MediaObject & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MediaObjectClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    associatedArticle: Schema.NewsArticle | undefined;
    @rdfine.property.literal()
    bitrate: string | undefined;
    @rdfine.property.literal()
    contentSize: string | undefined;
    @rdfine.property()
    contentUrl: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    duration: Schema.Duration | undefined;
    @rdfine.property()
    embedUrl: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    encodesCreativeWork: Schema.CreativeWork | undefined;
    @rdfine.property.literal()
    encodingFormat: string | undefined;
    @rdfine.property({ path: schema.encodingFormat })
    encodingFormatTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    endTime: Date | undefined;
    @rdfine.property.resource()
    height: Schema.Distance | Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    ineligibleRegion: Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.ineligibleRegion })
    ineligibleRegionLiteral: string | undefined;
    @rdfine.property.resource()
    interpretedAsClaim: Schema.Claim | undefined;
    @rdfine.property.literal()
    playerType: string | undefined;
    @rdfine.property.resource()
    productionCompany: Schema.Organization | undefined;
    @rdfine.property.resource()
    regionsAllowed: Schema.Place | undefined;
    @rdfine.property.resource()
    requiresSubscription: Schema.MediaSubscription | undefined;
    @rdfine.property.literal({ path: schema.requiresSubscription, type: Boolean })
    requiresSubscriptionLiteral: boolean | undefined;
    @rdfine.property.literal()
    'sha256': string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    startTime: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    uploadDate: Date | undefined;
    @rdfine.property.resource()
    width: Schema.Distance | Schema.QuantitativeValue | undefined;
  }
  return MediaObjectClass as any
}
MediaObjectMixin.appliesTo = schema.MediaObject
MediaObjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<MediaObject>([CreativeWorkMixin, MediaObjectMixin], { types: [schema.MediaObject] }, env)
