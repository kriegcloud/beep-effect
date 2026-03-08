import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EventMixin } from './Event.js';

export interface SportsEvent<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Event<D>, rdfine.RdfResource<D> {
  awayTeam: Schema.Person<D> | Schema.SportsTeam<D> | undefined;
  competitor: Schema.Person<D> | Schema.SportsTeam<D> | undefined;
  homeTeam: Schema.Person<D> | Schema.SportsTeam<D> | undefined;
  sport: string | undefined;
  sportTerm: RDF.NamedNode | undefined;
}

export function SportsEventMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SportsEvent & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SportsEventClass extends EventMixin(Resource) {
    @rdfine.property.resource()
    awayTeam: Schema.Person | Schema.SportsTeam | undefined;
    @rdfine.property.resource()
    competitor: Schema.Person | Schema.SportsTeam | undefined;
    @rdfine.property.resource()
    homeTeam: Schema.Person | Schema.SportsTeam | undefined;
    @rdfine.property.literal()
    sport: string | undefined;
    @rdfine.property({ path: schema.sport })
    sportTerm: RDF.NamedNode | undefined;
  }
  return SportsEventClass as any
}
SportsEventMixin.appliesTo = schema.SportsEvent
SportsEventMixin.createFactory = (env: RdfineEnvironment) => createFactory<SportsEvent>([EventMixin, SportsEventMixin], { types: [schema.SportsEvent] }, env)
