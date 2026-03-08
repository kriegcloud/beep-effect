import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface CreativeWork<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  about: Schema.Thing<D> | undefined;
  abstract: string | undefined;
  accessibilityAPI: string | undefined;
  accessibilityControl: string | undefined;
  accessibilityFeature: string | undefined;
  accessibilityHazard: string | undefined;
  accessibilitySummary: string | undefined;
  accessMode: string | undefined;
  accessModeSufficient: Schema.ItemList<D> | undefined;
  accountablePerson: Schema.Person<D> | undefined;
  acquireLicensePage: Schema.CreativeWork<D> | undefined;
  aggregateRating: Schema.AggregateRating<D> | undefined;
  alternativeHeadline: string | undefined;
  archivedAt: Schema.WebPage<D> | undefined;
  assesses: string | undefined;
  associatedMedia: Schema.MediaObject<D> | undefined;
  audience: Schema.Audience<D> | undefined;
  audio: Schema.AudioObject<D> | Schema.Clip<D> | Schema.MusicRecording<D> | undefined;
  author: Schema.Organization<D> | Schema.Person<D> | undefined;
  award: string | undefined;
  awards: string | undefined;
  character: Schema.Person<D> | undefined;
  citation: Schema.CreativeWork<D> | undefined;
  citationLiteral: string | undefined;
  comment: Schema.Comment<D> | undefined;
  commentCount: number | undefined;
  conditionsOfAccess: string | undefined;
  contentLocation: Schema.Place<D> | undefined;
  contentRating: Schema.Rating<D> | undefined;
  contentRatingLiteral: string | undefined;
  contentReferenceTime: Date | undefined;
  contributor: Schema.Organization<D> | Schema.Person<D> | undefined;
  copyrightHolder: Schema.Organization<D> | Schema.Person<D> | undefined;
  copyrightNotice: string | undefined;
  copyrightYear: number | undefined;
  correction: Schema.CorrectionComment<D> | undefined;
  correctionLiteral: string | undefined;
  countryOfOrigin: Schema.Country<D> | undefined;
  creativeWorkStatus: string | undefined;
  creator: Schema.Organization<D> | Schema.Person<D> | undefined;
  creditText: string | undefined;
  dateCreated: Date | undefined;
  dateModified: Date | undefined;
  datePublished: Date | undefined;
  discussionUrl: RDF.NamedNode | undefined;
  editEIDR: string | undefined;
  editEIDRTerm: RDF.NamedNode | undefined;
  editor: Schema.Person<D> | undefined;
  educationalAlignment: Schema.AlignmentObject<D> | undefined;
  educationalLevel: string | undefined;
  educationalLevelTerm: RDF.NamedNode | undefined;
  educationalUse: string | undefined;
  encoding: Schema.MediaObject<D> | undefined;
  encodingFormat: string | undefined;
  encodingFormatTerm: RDF.NamedNode | undefined;
  encodings: Schema.MediaObject<D> | undefined;
  exampleOfWork: Schema.CreativeWork<D> | undefined;
  expires: Date | undefined;
  fileFormat: string | undefined;
  fileFormatTerm: RDF.NamedNode | undefined;
  funder: Schema.Organization<D> | Schema.Person<D> | undefined;
  funding: Schema.Grant<D> | undefined;
  genre: string | undefined;
  genreTerm: RDF.NamedNode | undefined;
  hasPart: Schema.CreativeWork<D> | undefined;
  headline: string | undefined;
  inLanguage: Schema.Language<D> | undefined;
  inLanguageLiteral: string | undefined;
  interactionStatistic: Schema.InteractionCounter<D> | undefined;
  interactivityType: string | undefined;
  interpretedAsClaim: Schema.Claim<D> | undefined;
  isAccessibleForFree: boolean | undefined;
  isBasedOn: Schema.CreativeWork<D> | Schema.Product<D> | undefined;
  isBasedOnUrl: Schema.CreativeWork<D> | Schema.Product<D> | undefined;
  isFamilyFriendly: boolean | undefined;
  isPartOf: Schema.CreativeWork<D> | undefined;
  keywords: string | undefined;
  keywordsTerm: RDF.NamedNode | undefined;
  learningResourceType: string | undefined;
  license: Schema.CreativeWork<D> | undefined;
  locationCreated: Schema.Place<D> | undefined;
  mainEntity: Schema.Thing<D> | undefined;
  maintainer: Schema.Organization<D> | Schema.Person<D> | undefined;
  material: Schema.Product<D> | undefined;
  materialExtent: Schema.QuantitativeValue<D> | undefined;
  materialExtentLiteral: string | undefined;
  materialLiteral: string | undefined;
  mentions: Schema.Thing<D> | undefined;
  offers: Schema.Demand<D> | Schema.Offer<D> | undefined;
  pattern: string | undefined;
  position: number | string | undefined;
  producer: Schema.Organization<D> | Schema.Person<D> | undefined;
  provider: Schema.Organization<D> | Schema.Person<D> | undefined;
  publication: Schema.PublicationEvent<D> | undefined;
  publisher: Schema.Organization<D> | Schema.Person<D> | undefined;
  publisherImprint: Schema.Organization<D> | undefined;
  publishingPrinciples: Schema.CreativeWork<D> | undefined;
  recordedAt: Schema.Event<D> | undefined;
  releasedEvent: Schema.PublicationEvent<D> | undefined;
  review: Schema.Review<D> | undefined;
  reviews: Schema.Review<D> | undefined;
  schemaVersion: string | undefined;
  schemaVersionTerm: RDF.NamedNode | undefined;
  sdDatePublished: Date | undefined;
  sdLicense: Schema.CreativeWork<D> | undefined;
  sdPublisher: Schema.Organization<D> | Schema.Person<D> | undefined;
  size: Schema.QuantitativeValue<D> | undefined;
  sizeLiteral: string | undefined;
  sourceOrganization: Schema.Organization<D> | undefined;
  spatial: Schema.Place<D> | undefined;
  spatialCoverage: Schema.Place<D> | undefined;
  sponsor: Schema.Organization<D> | Schema.Person<D> | undefined;
  teaches: string | undefined;
  temporal: Date | string | undefined;
  temporalCoverage: Date | string | undefined;
  temporalCoverageTerm: RDF.NamedNode | undefined;
  text: string | undefined;
  thumbnailUrl: RDF.NamedNode | undefined;
  timeRequired: Schema.Duration<D> | undefined;
  translationOfWork: Schema.CreativeWork<D> | undefined;
  translator: Schema.Organization<D> | Schema.Person<D> | undefined;
  typicalAgeRange: string | undefined;
  usageInfo: Schema.CreativeWork<D> | undefined;
  version: number | string | undefined;
  video: Schema.Clip<D> | Schema.VideoObject<D> | undefined;
  workExample: Schema.CreativeWork<D> | undefined;
  workTranslation: Schema.CreativeWork<D> | undefined;
}

export function CreativeWorkMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CreativeWork & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CreativeWorkClass extends ThingMixin(Resource) {
    @rdfine.property.resource()
    about: Schema.Thing | undefined;
    @rdfine.property.literal()
    abstract: string | undefined;
    @rdfine.property.literal()
    accessibilityAPI: string | undefined;
    @rdfine.property.literal()
    accessibilityControl: string | undefined;
    @rdfine.property.literal()
    accessibilityFeature: string | undefined;
    @rdfine.property.literal()
    accessibilityHazard: string | undefined;
    @rdfine.property.literal()
    accessibilitySummary: string | undefined;
    @rdfine.property.literal()
    accessMode: string | undefined;
    @rdfine.property.resource()
    accessModeSufficient: Schema.ItemList | undefined;
    @rdfine.property.resource()
    accountablePerson: Schema.Person | undefined;
    @rdfine.property.resource()
    acquireLicensePage: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    aggregateRating: Schema.AggregateRating | undefined;
    @rdfine.property.literal()
    alternativeHeadline: string | undefined;
    @rdfine.property.resource()
    archivedAt: Schema.WebPage | undefined;
    @rdfine.property.literal()
    assesses: string | undefined;
    @rdfine.property.resource()
    associatedMedia: Schema.MediaObject | undefined;
    @rdfine.property.resource()
    audience: Schema.Audience | undefined;
    @rdfine.property.resource()
    audio: Schema.AudioObject | Schema.Clip | Schema.MusicRecording | undefined;
    @rdfine.property.resource()
    author: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    award: string | undefined;
    @rdfine.property.literal()
    awards: string | undefined;
    @rdfine.property.resource()
    character: Schema.Person | undefined;
    @rdfine.property.resource()
    citation: Schema.CreativeWork | undefined;
    @rdfine.property.literal({ path: schema.citation })
    citationLiteral: string | undefined;
    @rdfine.property.resource()
    comment: Schema.Comment | undefined;
    @rdfine.property.literal({ type: Number })
    commentCount: number | undefined;
    @rdfine.property.literal()
    conditionsOfAccess: string | undefined;
    @rdfine.property.resource()
    contentLocation: Schema.Place | undefined;
    @rdfine.property.resource()
    contentRating: Schema.Rating | undefined;
    @rdfine.property.literal({ path: schema.contentRating })
    contentRatingLiteral: string | undefined;
    @rdfine.property.literal({ type: Date })
    contentReferenceTime: Date | undefined;
    @rdfine.property.resource()
    contributor: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    copyrightHolder: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    copyrightNotice: string | undefined;
    @rdfine.property.literal({ type: Number })
    copyrightYear: number | undefined;
    @rdfine.property.resource()
    correction: Schema.CorrectionComment | undefined;
    @rdfine.property.literal({ path: schema.correction })
    correctionLiteral: string | undefined;
    @rdfine.property.resource()
    countryOfOrigin: Schema.Country | undefined;
    @rdfine.property.literal()
    creativeWorkStatus: string | undefined;
    @rdfine.property.resource()
    creator: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    creditText: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    dateCreated: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    dateModified: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    datePublished: Date | undefined;
    @rdfine.property()
    discussionUrl: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    editEIDR: string | undefined;
    @rdfine.property({ path: schema.editEIDR })
    editEIDRTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    editor: Schema.Person | undefined;
    @rdfine.property.resource()
    educationalAlignment: Schema.AlignmentObject | undefined;
    @rdfine.property.literal()
    educationalLevel: string | undefined;
    @rdfine.property({ path: schema.educationalLevel })
    educationalLevelTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    educationalUse: string | undefined;
    @rdfine.property.resource()
    encoding: Schema.MediaObject | undefined;
    @rdfine.property.literal()
    encodingFormat: string | undefined;
    @rdfine.property({ path: schema.encodingFormat })
    encodingFormatTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    encodings: Schema.MediaObject | undefined;
    @rdfine.property.resource()
    exampleOfWork: Schema.CreativeWork | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    expires: Date | undefined;
    @rdfine.property.literal()
    fileFormat: string | undefined;
    @rdfine.property({ path: schema.fileFormat })
    fileFormatTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    funder: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    funding: Schema.Grant | undefined;
    @rdfine.property.literal()
    genre: string | undefined;
    @rdfine.property({ path: schema.genre })
    genreTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    hasPart: Schema.CreativeWork | undefined;
    @rdfine.property.literal()
    headline: string | undefined;
    @rdfine.property.resource()
    inLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.inLanguage })
    inLanguageLiteral: string | undefined;
    @rdfine.property.resource()
    interactionStatistic: Schema.InteractionCounter | undefined;
    @rdfine.property.literal()
    interactivityType: string | undefined;
    @rdfine.property.resource()
    interpretedAsClaim: Schema.Claim | undefined;
    @rdfine.property.literal({ type: Boolean })
    isAccessibleForFree: boolean | undefined;
    @rdfine.property.resource()
    isBasedOn: Schema.CreativeWork | Schema.Product | undefined;
    @rdfine.property.resource()
    isBasedOnUrl: Schema.CreativeWork | Schema.Product | undefined;
    @rdfine.property.literal({ type: Boolean })
    isFamilyFriendly: boolean | undefined;
    @rdfine.property.resource()
    isPartOf: Schema.CreativeWork | undefined;
    @rdfine.property.literal()
    keywords: string | undefined;
    @rdfine.property({ path: schema.keywords })
    keywordsTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    learningResourceType: string | undefined;
    @rdfine.property.resource()
    license: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    locationCreated: Schema.Place | undefined;
    @rdfine.property.resource()
    mainEntity: Schema.Thing | undefined;
    @rdfine.property.resource()
    maintainer: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    material: Schema.Product | undefined;
    @rdfine.property.resource()
    materialExtent: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.materialExtent })
    materialExtentLiteral: string | undefined;
    @rdfine.property.literal({ path: schema.material })
    materialLiteral: string | undefined;
    @rdfine.property.resource()
    mentions: Schema.Thing | undefined;
    @rdfine.property.resource()
    offers: Schema.Demand | Schema.Offer | undefined;
    @rdfine.property.literal()
    pattern: string | undefined;
    @rdfine.property.literal()
    position: number | string | undefined;
    @rdfine.property.resource()
    producer: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    provider: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    publication: Schema.PublicationEvent | undefined;
    @rdfine.property.resource()
    publisher: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    publisherImprint: Schema.Organization | undefined;
    @rdfine.property.resource()
    publishingPrinciples: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    recordedAt: Schema.Event | undefined;
    @rdfine.property.resource()
    releasedEvent: Schema.PublicationEvent | undefined;
    @rdfine.property.resource()
    review: Schema.Review | undefined;
    @rdfine.property.resource()
    reviews: Schema.Review | undefined;
    @rdfine.property.literal()
    schemaVersion: string | undefined;
    @rdfine.property({ path: schema.schemaVersion })
    schemaVersionTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    sdDatePublished: Date | undefined;
    @rdfine.property.resource()
    sdLicense: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    sdPublisher: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    size: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.size })
    sizeLiteral: string | undefined;
    @rdfine.property.resource()
    sourceOrganization: Schema.Organization | undefined;
    @rdfine.property.resource()
    spatial: Schema.Place | undefined;
    @rdfine.property.resource()
    spatialCoverage: Schema.Place | undefined;
    @rdfine.property.resource()
    sponsor: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    teaches: string | undefined;
    @rdfine.property.literal()
    temporal: Date | string | undefined;
    @rdfine.property.literal()
    temporalCoverage: Date | string | undefined;
    @rdfine.property({ path: schema.temporalCoverage })
    temporalCoverageTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    text: string | undefined;
    @rdfine.property()
    thumbnailUrl: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    timeRequired: Schema.Duration | undefined;
    @rdfine.property.resource()
    translationOfWork: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    translator: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    typicalAgeRange: string | undefined;
    @rdfine.property.resource()
    usageInfo: Schema.CreativeWork | undefined;
    @rdfine.property.literal()
    version: number | string | undefined;
    @rdfine.property.resource()
    video: Schema.Clip | Schema.VideoObject | undefined;
    @rdfine.property.resource()
    workExample: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    workTranslation: Schema.CreativeWork | undefined;
  }
  return CreativeWorkClass as any
}
CreativeWorkMixin.appliesTo = schema.CreativeWork
CreativeWorkMixin.createFactory = (env: RdfineEnvironment) => createFactory<CreativeWork>([ThingMixin, CreativeWorkMixin], { types: [schema.CreativeWork] }, env)
