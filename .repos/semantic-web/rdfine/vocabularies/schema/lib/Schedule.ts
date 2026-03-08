import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Schedule<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  byDay: string | undefined;
  byDayTerm: Schema.DayOfWeek | undefined;
  byMonth: number | undefined;
  byMonthDay: number | undefined;
  byMonthWeek: number | undefined;
  duration: Schema.Duration<D> | undefined;
  endDate: Date | undefined;
  endTime: Date | undefined;
  exceptDate: Date | undefined;
  repeatCount: number | undefined;
  repeatFrequency: Schema.Duration<D> | undefined;
  repeatFrequencyLiteral: string | undefined;
  scheduleTimezone: string | undefined;
  startDate: Date | undefined;
  startTime: Date | undefined;
}

export function ScheduleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Schedule & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ScheduleClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal()
    byDay: string | undefined;
    @rdfine.property({ path: schema.byDay })
    byDayTerm: Schema.DayOfWeek | undefined;
    @rdfine.property.literal({ type: Number })
    byMonth: number | undefined;
    @rdfine.property.literal({ type: Number })
    byMonthDay: number | undefined;
    @rdfine.property.literal({ type: Number })
    byMonthWeek: number | undefined;
    @rdfine.property.resource()
    duration: Schema.Duration | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    endDate: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    endTime: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    exceptDate: Date | undefined;
    @rdfine.property.literal({ type: Number })
    repeatCount: number | undefined;
    @rdfine.property.resource()
    repeatFrequency: Schema.Duration | undefined;
    @rdfine.property.literal({ path: schema.repeatFrequency })
    repeatFrequencyLiteral: string | undefined;
    @rdfine.property.literal()
    scheduleTimezone: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    startDate: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    startTime: Date | undefined;
  }
  return ScheduleClass as any
}
ScheduleMixin.appliesTo = schema.Schedule
ScheduleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Schedule>([IntangibleMixin, ScheduleMixin], { types: [schema.Schedule] }, env)
