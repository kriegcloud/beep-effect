import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { AgentMixin } from './Agent.js';

export interface Person<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Agent<D>, rdfine.RdfResource<D> {
  birthDate: RDF.Literal | undefined;
  deathDate: RDF.Literal | undefined;
  hasAncestor: Rico.Person<D> | undefined;
  hasBirthDate: Rico.Date<D> | undefined;
  hasBirthPlace: Rico.Place<D> | undefined;
  hasChild: Rico.Person<D> | undefined;
  hasDeathDate: Rico.Date<D> | undefined;
  hasDeathPlace: Rico.Place<D> | undefined;
  hasDescendant: Rico.Person<D> | undefined;
  hasFamilyAssociationWith: Rico.Person<D> | undefined;
  hasOrHadCorrespondent: Rico.Person<D> | undefined;
  hasOrHadDemographicGroup: Rico.DemographicGroup<D> | undefined;
  hasOrHadEmployer: Rico.CorporateBody<D> | Rico.Person<D> | undefined;
  hasOrHadOccupationOfType: Rico.OccupationType<D> | undefined;
  hasOrHadSpouse: Rico.Person<D> | undefined;
  hasOrHadStudent: Rico.Person<D> | undefined;
  hasOrHadTeacher: Rico.Person<D> | undefined;
  hasSibling: Rico.Person<D> | undefined;
  isAuthorOf: Rico.Record<D> | undefined;
  isChildOf: Rico.Person<D> | undefined;
  isOrWasEmployerOf: Rico.Person<D> | undefined;
  isOrWasHolderOfIntellectualPropertyRightsOf: Rico.Instantiation<D> | Rico.RecordResource<D> | undefined;
  isOrWasLeaderOf: Rico.Group<D> | undefined;
  isOrWasMemberOf: Rico.Group<D> | undefined;
  isOrWasOwnerOf: Rico.Thing<D> | undefined;
  knownBy: Rico.Person<D> | undefined;
  knows: Rico.Person<D> | undefined;
  knowsOf: Rico.Person<D> | undefined;
  occupiesOrOccupied: Rico.Position<D> | undefined;
}

export function PersonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Person & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class PersonClass extends AgentMixin(Resource) {
    @rdfine.property()
    birthDate: RDF.Literal | undefined;
    @rdfine.property()
    deathDate: RDF.Literal | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasAncestor: Rico.Person | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Date] })
    hasBirthDate: Rico.Date | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Place] })
    hasBirthPlace: Rico.Place | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasChild: Rico.Person | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Date] })
    hasDeathDate: Rico.Date | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Place] })
    hasDeathPlace: Rico.Place | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasDescendant: Rico.Person | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasFamilyAssociationWith: Rico.Person | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasOrHadCorrespondent: Rico.Person | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.DemographicGroup] })
    hasOrHadDemographicGroup: Rico.DemographicGroup | undefined;
    @rdfine.property.resource()
    hasOrHadEmployer: Rico.CorporateBody | Rico.Person | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.OccupationType] })
    hasOrHadOccupationOfType: Rico.OccupationType | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasOrHadSpouse: Rico.Person | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasOrHadStudent: Rico.Person | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasOrHadTeacher: Rico.Person | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    hasSibling: Rico.Person | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Record] })
    isAuthorOf: Rico.Record | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    isChildOf: Rico.Person | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    isOrWasEmployerOf: Rico.Person | undefined;
    @rdfine.property.resource()
    isOrWasHolderOfIntellectualPropertyRightsOf: Rico.Instantiation | Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Group] })
    isOrWasLeaderOf: Rico.Group | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Group] })
    isOrWasMemberOf: Rico.Group | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    isOrWasOwnerOf: Rico.Thing | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    knownBy: Rico.Person | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    knows: Rico.Person | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    knowsOf: Rico.Person | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Position] })
    occupiesOrOccupied: Rico.Position | undefined;
  }
  return PersonClass as any
}
PersonMixin.appliesTo = rico.Person
PersonMixin.createFactory = (env: RdfineEnvironment) => createFactory<Person>([AgentMixin, PersonMixin], { types: [rico.Person] }, env)
