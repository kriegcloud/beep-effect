import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface RepaymentSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  downPayment: Schema.MonetaryAmount<D> | undefined;
  downPaymentLiteral: number | undefined;
  earlyPrepaymentPenalty: Schema.MonetaryAmount<D> | undefined;
  loanPaymentAmount: Schema.MonetaryAmount<D> | undefined;
  loanPaymentFrequency: number | undefined;
  numberOfLoanPayments: number | undefined;
}

export function RepaymentSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RepaymentSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RepaymentSpecificationClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    downPayment: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ path: schema.downPayment, type: Number })
    downPaymentLiteral: number | undefined;
    @rdfine.property.resource()
    earlyPrepaymentPenalty: Schema.MonetaryAmount | undefined;
    @rdfine.property.resource()
    loanPaymentAmount: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ type: Number })
    loanPaymentFrequency: number | undefined;
    @rdfine.property.literal({ type: Number })
    numberOfLoanPayments: number | undefined;
  }
  return RepaymentSpecificationClass as any
}
RepaymentSpecificationMixin.appliesTo = schema.RepaymentSpecification
RepaymentSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<RepaymentSpecification>([StructuredValueMixin, RepaymentSpecificationMixin], { types: [schema.RepaymentSpecification] }, env)
