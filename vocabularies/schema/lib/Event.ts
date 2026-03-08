import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Event<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  about: Schema.Thing<D> | undefined;
  actor: Schema.Person<D> | undefined;
  aggregateRating: Schema.AggregateRating<D> | undefined;
  attendee: Schema.Organization<D> | Schema.Person<D> | undefined;
  attendees: Schema.Organization<D> | Schema.Person<D> | undefined;
  audience: Schema.Audience<D> | undefined;
  composer: Schema.Organization<D> | Schema.Person<D> | undefined;
  contributor: Schema.Organization<D> | Schema.Person<D> | undefined;
  director: Schema.Person<D> | undefined;
  doorTime: Date | undefined;
  duration: Schema.Duration<D> | undefined;
  endDate: Date | undefined;
  eventAttendanceMode: Schema.EventAttendanceModeEnumeration | undefined;
  eventSchedule: Schema.Schedule<D> | undefined;
  eventStatus: Schema.EventStatusType | undefined;
  funder: Schema.Organization<D> | Schema.Person<D> | undefined;
  funding: Schema.Grant<D> | undefined;
  inLanguage: Schema.Language<D> | undefined;
  inLanguageLiteral: string | undefined;
  isAccessibleForFree: boolean | undefined;
  keywords: string | undefined;
  keywordsTerm: RDF.NamedNode | undefined;
  location: Schema.Place<D> | Schema.PostalAddress<D> | undefined;
  locationLiteral: string | undefined;
  maximumAttendeeCapacity: number | undefined;
  maximumPhysicalAttendeeCapacity: number | undefined;
  maximumVirtualAttendeeCapacity: number | undefined;
  offers: Schema.Demand<D> | Schema.Offer<D> | undefined;
  organizer: Schema.Organization<D> | Schema.Person<D> | undefined;
  performer: Schema.Organization<D> | Schema.Person<D> | undefined;
  performers: Schema.Organization<D> | Schema.Person<D> | undefined;
  previousStartDate: Date | undefined;
  recordedIn: Schema.CreativeWork<D> | undefined;
  remainingAttendeeCapacity: number | undefined;
  review: Schema.Review<D> | undefined;
  sponsor: Schema.Organization<D> | Schema.Person<D> | undefined;
  startDate: Date | undefined;
  subEvent: Schema.Event<D> | undefined;
  subEvents: Schema.Event<D> | undefined;
  superEvent: Schema.Event<D> | undefined;
  translator: Schema.Organization<D> | Schema.Person<D> | undefined;
  typicalAgeRange: string | undefined;
  workFeatured: Schema.CreativeWork<D> | undefined;
  workPerformed: Schema.CreativeWork<D> | undefined;
}

export function EventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Event & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EventClass extends ThingMixin(Resource) {
    @rdfine.property.resource()
    about: Schema.Thing | undefined;
    @rdfine.property.resource()
    actor: Schema.Person | undefined;
    @rdfine.property.resource()
    aggregateRating: Schema.AggregateRating | undefined;
    @rdfine.property.resource()
    attendee: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    attendees: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    audience: Schema.Audience | undefined;
    @rdfine.property.resource()
    composer: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    contributor: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    director: Schema.Person | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    doorTime: Date | undefined;
    @rdfine.property.resource()
    duration: Schema.Duration | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    endDate: Date | undefined;
    @rdfine.property()
    eventAttendanceMode: Schema.EventAttendanceModeEnumeration | undefined;
    @rdfine.property.resource()
    eventSchedule: Schema.Schedule | undefined;
    @rdfine.property()
    eventStatus: Schema.EventStatusType | undefined;
    @rdfine.property.resource()
    funder: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    funding: Schema.Grant | undefined;
    @rdfine.property.resource()
    inLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.inLanguage })
    inLanguageLiteral: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    isAccessibleForFree: boolean | undefined;
    @rdfine.property.literal()
    keywords: string | undefined;
    @rdfine.property({ path: schema.keywords })
    keywordsTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    location: Schema.Place | Schema.PostalAddress | undefined;
    @rdfine.property.literal({ path: schema.location })
    locationLiteral: string | undefined;
    @rdfine.property.literal({ type: Number })
    maximumAttendeeCapacity: number | undefined;
    @rdfine.property.literal({ type: Number })
    maximumPhysicalAttendeeCapacity: number | undefined;
    @rdfine.property.literal({ type: Number })
    maximumVirtualAttendeeCapacity: number | undefined;
    @rdfine.property.resource()
    offers: Schema.Demand | Schema.Offer | undefined;
    @rdfine.property.resource()
    organizer: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    performer: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    performers: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    previousStartDate: Date | undefined;
    @rdfine.property.resource()
    recordedIn: Schema.CreativeWork | undefined;
    @rdfine.property.literal({ type: Number })
    remainingAttendeeCapacity: number | undefined;
    @rdfine.property.resource()
    review: Schema.Review | undefined;
    @rdfine.property.resource()
    sponsor: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    startDate: Date | undefined;
    @rdfine.property.resource()
    subEvent: Schema.Event | undefined;
    @rdfine.property.resource()
    subEvents: Schema.Event | undefined;
    @rdfine.property.resource()
    superEvent: Schema.Event | undefined;
    @rdfine.property.resource()
    translator: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    typicalAgeRange: string | undefined;
    @rdfine.property.resource()
    workFeatured: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    workPerformed: Schema.CreativeWork | undefined;
  }
  return EventClass as any
}
EventMixin.appliesTo = schema.Event
EventMixin.createFactory = (env: RdfineEnvironment) => createFactory<Event>([ThingMixin, EventMixin], { types: [schema.Event] }, env)
