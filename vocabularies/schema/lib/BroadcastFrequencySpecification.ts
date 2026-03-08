import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface BroadcastFrequencySpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  broadcastFrequencyValue: Schema.QuantitativeValue<D> | undefined;
  broadcastFrequencyValueLiteral: number | undefined;
  broadcastSignalModulation: string | undefined;
  broadcastSignalModulationTerm: Schema.QualitativeValue | undefined;
  broadcastSubChannel: string | undefined;
}

export function BroadcastFrequencySpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BroadcastFrequencySpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BroadcastFrequencySpecificationClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    broadcastFrequencyValue: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.broadcastFrequencyValue, type: Number })
    broadcastFrequencyValueLiteral: number | undefined;
    @rdfine.property.literal()
    broadcastSignalModulation: string | undefined;
    @rdfine.property({ path: schema.broadcastSignalModulation })
    broadcastSignalModulationTerm: Schema.QualitativeValue | undefined;
    @rdfine.property.literal()
    broadcastSubChannel: string | undefined;
  }
  return BroadcastFrequencySpecificationClass as any
}
BroadcastFrequencySpecificationMixin.appliesTo = schema.BroadcastFrequencySpecification
BroadcastFrequencySpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<BroadcastFrequencySpecification>([IntangibleMixin, BroadcastFrequencySpecificationMixin], { types: [schema.BroadcastFrequencySpecification] }, env)
