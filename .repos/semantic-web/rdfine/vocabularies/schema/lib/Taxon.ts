import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Taxon<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Thing<D>, rdfine.RdfResource<D> {
  childTaxon: Schema.Taxon<D> | undefined;
  childTaxonLiteral: string | undefined;
  hasDefinedTerm: RDF.Term | undefined;
  parentTaxon: Schema.Taxon<D> | undefined;
  parentTaxonLiteral: string | undefined;
  taxonRank: Schema.PropertyValue<D> | undefined;
  taxonRankLiteral: string | undefined;
}

export function TaxonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Taxon & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TaxonClass extends ThingMixin(Resource) {
    @rdfine.property.resource()
    childTaxon: Schema.Taxon | undefined;
    @rdfine.property.literal({ path: schema.childTaxon })
    childTaxonLiteral: string | undefined;
    @rdfine.property()
    hasDefinedTerm: RDF.Term | undefined;
    @rdfine.property.resource()
    parentTaxon: Schema.Taxon | undefined;
    @rdfine.property.literal({ path: schema.parentTaxon })
    parentTaxonLiteral: string | undefined;
    @rdfine.property.resource()
    taxonRank: Schema.PropertyValue | undefined;
    @rdfine.property.literal({ path: schema.taxonRank })
    taxonRankLiteral: string | undefined;
  }
  return TaxonClass as any
}
TaxonMixin.appliesTo = schema.Taxon
TaxonMixin.createFactory = (env: RdfineEnvironment) => createFactory<Taxon>([ThingMixin, TaxonMixin], { types: [schema.Taxon] }, env)
