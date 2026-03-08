import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReservationMixin } from './Reservation.js';

export interface ReservationPackage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Reservation<D>, rdfine.RdfResource<D> {
  subReservation: Schema.Reservation<D> | undefined;
}

export function ReservationPackageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReservationPackage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReservationPackageClass extends ReservationMixin(Resource) {
    @rdfine.property.resource()
    subReservation: Schema.Reservation | undefined;
  }
  return ReservationPackageClass as any
}
ReservationPackageMixin.appliesTo = schema.ReservationPackage
ReservationPackageMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReservationPackage>([ReservationMixin, ReservationPackageMixin], { types: [schema.ReservationPackage] }, env)
