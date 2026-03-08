import '../extensions/rdfs/Resource.js';
import { ResourceMixinEx } from '../extensions/rdfs/Resource.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { owl } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Owl from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface NegativePropertyAssertion<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  assertionProperty: Rdf.Property<D> | undefined;
  sourceIndividual: RDF.NamedNode | undefined;
  targetIndividual: RDF.NamedNode | undefined;
  targetValue: string | undefined;
}

export function NegativePropertyAssertionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NegativePropertyAssertion & RdfResourceCore> & Base {
  @rdfine.namespace(owl)
  class NegativePropertyAssertionClass extends ResourceMixinEx(RdfsResourceMixin(Resource)) {
    @rdfine.property.resource({ as: [RdfPropertyMixin] })
    assertionProperty: Rdf.Property | undefined;
    @rdfine.property()
    sourceIndividual: RDF.NamedNode | undefined;
    @rdfine.property()
    targetIndividual: RDF.NamedNode | undefined;
    @rdfine.property.literal()
    targetValue: string | undefined;
  }
  return NegativePropertyAssertionClass as any
}
NegativePropertyAssertionMixin.appliesTo = owl.NegativePropertyAssertion
NegativePropertyAssertionMixin.createFactory = (env: RdfineEnvironment) => createFactory<NegativePropertyAssertion>([RdfsResourceMixin, NegativePropertyAssertionMixin], { types: [owl.NegativePropertyAssertion] }, env)
