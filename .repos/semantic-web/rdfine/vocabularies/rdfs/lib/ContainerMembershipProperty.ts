import '../extensions/rdf/Property.js';
import { PropertyMixinEx } from '../extensions/rdf/Property.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rdfs } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rdfs from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import { PropertyMixin as RdfPropertyMixin } from '@rdfine/rdf/lib/Property';

export interface ContainerMembershipProperty<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdf.Property<D>, rdfine.RdfResource<D> {
}

export function ContainerMembershipPropertyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ContainerMembershipProperty & RdfResourceCore> & Base {
  @rdfine.namespace(rdfs)
  class ContainerMembershipPropertyClass extends PropertyMixinEx(RdfPropertyMixin(Resource)) {
  }
  return ContainerMembershipPropertyClass as any
}
ContainerMembershipPropertyMixin.appliesTo = rdfs.ContainerMembershipProperty
ContainerMembershipPropertyMixin.createFactory = (env: RdfineEnvironment) => createFactory<ContainerMembershipProperty>([RdfPropertyMixin, ContainerMembershipPropertyMixin], { types: [rdfs.ContainerMembershipProperty] }, env)
