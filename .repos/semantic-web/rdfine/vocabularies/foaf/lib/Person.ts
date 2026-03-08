import '../extensions/wgs/SpatialThing.js';
import { SpatialThingMixinEx } from '../extensions/wgs/SpatialThing.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';
import type * as Wgs from '@rdfine/wgs';
import { AgentMixin } from './Agent.js';
import { SpatialThingMixin as WgsSpatialThingMixin } from '@rdfine/wgs/lib/SpatialThing';

export interface Person<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.Agent<D>, Wgs.SpatialThing<D>, rdfine.RdfResource<D> {
  currentProject: RDF.NamedNode | undefined;
  'family_name': RDF.Literal | undefined;
  familyName: RDF.Literal | undefined;
  firstName: RDF.Literal | undefined;
  geekcode: RDF.Literal | undefined;
  img: Foaf.Image<D> | undefined;
  knows: Foaf.Person<D> | undefined;
  lastName: RDF.Literal | undefined;
  myersBriggs: RDF.Literal | undefined;
  pastProject: RDF.NamedNode | undefined;
  plan: RDF.Literal | undefined;
  publications: Foaf.Document<D> | undefined;
  schoolHomepage: Foaf.Document<D> | undefined;
  surname: RDF.Literal | undefined;
  workInfoHomepage: Foaf.Document<D> | undefined;
  workplaceHomepage: Foaf.Document<D> | undefined;
}

export function PersonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Person & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class PersonClass extends SpatialThingMixinEx(WgsSpatialThingMixin(AgentMixin(Resource))) {
    @rdfine.property()
    currentProject: RDF.NamedNode | undefined;
    @rdfine.property()
    'family_name': RDF.Literal | undefined;
    @rdfine.property()
    familyName: RDF.Literal | undefined;
    @rdfine.property()
    firstName: RDF.Literal | undefined;
    @rdfine.property()
    geekcode: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Image] })
    img: Foaf.Image | undefined;
    @rdfine.property.resource({ as: [PersonMixin] })
    knows: Foaf.Person | undefined;
    @rdfine.property()
    lastName: RDF.Literal | undefined;
    @rdfine.property()
    myersBriggs: RDF.Literal | undefined;
    @rdfine.property()
    pastProject: RDF.NamedNode | undefined;
    @rdfine.property()
    plan: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    publications: Foaf.Document | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    schoolHomepage: Foaf.Document | undefined;
    @rdfine.property()
    surname: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    workInfoHomepage: Foaf.Document | undefined;
    @rdfine.property.resource({ implicitTypes: [foaf.Document] })
    workplaceHomepage: Foaf.Document | undefined;
  }
  return PersonClass as any
}
PersonMixin.appliesTo = foaf.Person
PersonMixin.createFactory = (env: RdfineEnvironment) => createFactory<Person>([WgsSpatialThingMixin, AgentMixin, PersonMixin], { types: [foaf.Person] }, env)
