import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface FoodEstablishment<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
  acceptsReservations: boolean | string | undefined;
  acceptsReservationsTerm: RDF.NamedNode | undefined;
  hasMenu: Schema.Menu<D> | undefined;
  hasMenuLiteral: string | undefined;
  menu: Schema.Menu<D> | undefined;
  menuLiteral: string | undefined;
  servesCuisine: string | undefined;
  starRating: Schema.Rating<D> | undefined;
}

export function FoodEstablishmentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FoodEstablishment & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FoodEstablishmentClass extends LocalBusinessMixin(Resource) {
    @rdfine.property.literal()
    acceptsReservations: boolean | string | undefined;
    @rdfine.property({ path: schema.acceptsReservations })
    acceptsReservationsTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    hasMenu: Schema.Menu | undefined;
    @rdfine.property.literal({ path: schema.hasMenu })
    hasMenuLiteral: string | undefined;
    @rdfine.property.resource()
    menu: Schema.Menu | undefined;
    @rdfine.property.literal({ path: schema.menu })
    menuLiteral: string | undefined;
    @rdfine.property.literal()
    servesCuisine: string | undefined;
    @rdfine.property.resource()
    starRating: Schema.Rating | undefined;
  }
  return FoodEstablishmentClass as any
}
FoodEstablishmentMixin.appliesTo = schema.FoodEstablishment
FoodEstablishmentMixin.createFactory = (env: RdfineEnvironment) => createFactory<FoodEstablishment>([LocalBusinessMixin, FoodEstablishmentMixin], { types: [schema.FoodEstablishment] }, env)
