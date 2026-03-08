import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlaceMixin } from './Place.js';

export interface TouristAttraction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Place<D>, rdfine.RdfResource<D> {
  availableLanguage: Schema.Language<D> | undefined;
  availableLanguageLiteral: string | undefined;
  touristType: Schema.Audience<D> | undefined;
  touristTypeLiteral: string | undefined;
}

export function TouristAttractionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TouristAttraction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TouristAttractionClass extends PlaceMixin(Resource) {
    @rdfine.property.resource()
    availableLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.availableLanguage })
    availableLanguageLiteral: string | undefined;
    @rdfine.property.resource()
    touristType: Schema.Audience | undefined;
    @rdfine.property.literal({ path: schema.touristType })
    touristTypeLiteral: string | undefined;
  }
  return TouristAttractionClass as any
}
TouristAttractionMixin.appliesTo = schema.TouristAttraction
TouristAttractionMixin.createFactory = (env: RdfineEnvironment) => createFactory<TouristAttraction>([PlaceMixin, TouristAttractionMixin], { types: [schema.TouristAttraction] }, env)
