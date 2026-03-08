import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceMixin } from './Place.js';

export interface TouristDestination<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Place<D>, rdfine.RdfResource<D> {
  includesAttraction: Schema.TouristAttraction<D> | undefined;
  touristType: Schema.Audience<D> | undefined;
  touristTypeLiteral: string | undefined;
}

export function TouristDestinationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TouristDestination & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TouristDestinationClass extends PlaceMixin(Resource) {
    @rdfine.property.resource()
    includesAttraction: Schema.TouristAttraction | undefined;
    @rdfine.property.resource()
    touristType: Schema.Audience | undefined;
    @rdfine.property.literal({ path: schema.touristType })
    touristTypeLiteral: string | undefined;
  }
  return TouristDestinationClass as any
}
TouristDestinationMixin.appliesTo = schema.TouristDestination
TouristDestinationMixin.createFactory = (env: RdfineEnvironment) => createFactory<TouristDestination>([PlaceMixin, TouristDestinationMixin], { types: [schema.TouristDestination] }, env)
