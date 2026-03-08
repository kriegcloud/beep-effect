import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';
import { PlaceMixin } from './Place.js';

export interface LocalBusiness<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, Schema.Place<D>, rdfine.RdfResource<D> {
  branchOf: Schema.Organization<D> | undefined;
  currenciesAccepted: string | undefined;
  openingHours: string | undefined;
  paymentAccepted: string | undefined;
  priceRange: string | undefined;
}

export function LocalBusinessMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LocalBusiness & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LocalBusinessClass extends PlaceMixin(OrganizationMixin(Resource)) {
    @rdfine.property.resource()
    branchOf: Schema.Organization | undefined;
    @rdfine.property.literal()
    currenciesAccepted: string | undefined;
    @rdfine.property.literal()
    openingHours: string | undefined;
    @rdfine.property.literal()
    paymentAccepted: string | undefined;
    @rdfine.property.literal()
    priceRange: string | undefined;
  }
  return LocalBusinessClass as any
}
LocalBusinessMixin.appliesTo = schema.LocalBusiness
LocalBusinessMixin.createFactory = (env: RdfineEnvironment) => createFactory<LocalBusiness>([PlaceMixin, OrganizationMixin, LocalBusinessMixin], { types: [schema.LocalBusiness] }, env)
