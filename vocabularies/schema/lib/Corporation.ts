import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface Corporation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
  tickerSymbol: string | undefined;
}

export function CorporationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Corporation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CorporationClass extends OrganizationMixin(Resource) {
    @rdfine.property.literal()
    tickerSymbol: string | undefined;
  }
  return CorporationClass as any
}
CorporationMixin.appliesTo = schema.Corporation
CorporationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Corporation>([OrganizationMixin, CorporationMixin], { types: [schema.Corporation] }, env)
