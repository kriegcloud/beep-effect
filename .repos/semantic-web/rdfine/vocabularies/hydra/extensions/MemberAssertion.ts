import { Constructor, namespace, RdfResource, property } from '@tpluscode/rdfine';
import type * as RDF from '@rdfjs/types';
import { hydra } from '../lib/namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';
import { createFactory, Factory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';

export interface MemberAssertion<D extends RDF.DatasetCore = RDF.DatasetCore> extends RdfResource<D> {
  object: Hydra.Class<D> | undefined;
  property: Rdf.Property<D> | undefined;
  subject: Hydra.Resource<D> | undefined;
}

declare global {
  interface HydraVocabulary {
    MemberAssertion: Factory<MemberAssertion>;
  }
}

export function MemberAssertionMixin<Base extends Constructor>(Resource: Base): Constructor<Partial<MemberAssertion> & RdfResourceCore> & Base {
  @namespace(hydra)
  class MemberAssertionClass extends Resource implements Partial<MemberAssertion> {
    @property.resource()
    object: Hydra.Class | undefined;
    @property.resource({ as: [RdfPropertyMixin] })
    property: Rdf.Property | undefined;
    @property.resource({ implicitTypes: [hydra.Resource] })
    subject: Hydra.Resource | undefined;
  }
  return MemberAssertionClass
}

MemberAssertionMixin.createFactory = (env:RdfineEnvironment) => createFactory<MemberAssertion>([MemberAssertionMixin], {}, env);
