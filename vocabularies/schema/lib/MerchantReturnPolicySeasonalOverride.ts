import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface MerchantReturnPolicySeasonalOverride<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  endDate: Date | undefined;
  merchantReturnDays: Date | number | undefined;
  returnPolicyCategory: Schema.MerchantReturnEnumeration | undefined;
  startDate: Date | undefined;
}

export function MerchantReturnPolicySeasonalOverrideMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MerchantReturnPolicySeasonalOverride & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MerchantReturnPolicySeasonalOverrideClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    endDate: Date | undefined;
    @rdfine.property.literal({ datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    merchantReturnDays: Date | number | undefined;
    @rdfine.property()
    returnPolicyCategory: Schema.MerchantReturnEnumeration | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    startDate: Date | undefined;
  }
  return MerchantReturnPolicySeasonalOverrideClass as any
}
MerchantReturnPolicySeasonalOverrideMixin.appliesTo = schema.MerchantReturnPolicySeasonalOverride
MerchantReturnPolicySeasonalOverrideMixin.createFactory = (env: RdfineEnvironment) => createFactory<MerchantReturnPolicySeasonalOverride>([IntangibleMixin, MerchantReturnPolicySeasonalOverrideMixin], { types: [schema.MerchantReturnPolicySeasonalOverride] }, env)
