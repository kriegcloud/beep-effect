import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Seat<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  seatingType: string | undefined;
  seatingTypeTerm: Schema.QualitativeValue | undefined;
  seatNumber: string | undefined;
  seatRow: string | undefined;
  seatSection: string | undefined;
}

export function SeatMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Seat & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SeatClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal()
    seatingType: string | undefined;
    @rdfine.property({ path: schema.seatingType })
    seatingTypeTerm: Schema.QualitativeValue | undefined;
    @rdfine.property.literal()
    seatNumber: string | undefined;
    @rdfine.property.literal()
    seatRow: string | undefined;
    @rdfine.property.literal()
    seatSection: string | undefined;
  }
  return SeatClass as any
}
SeatMixin.appliesTo = schema.Seat
SeatMixin.createFactory = (env: RdfineEnvironment) => createFactory<Seat>([IntangibleMixin, SeatMixin], { types: [schema.Seat] }, env)
