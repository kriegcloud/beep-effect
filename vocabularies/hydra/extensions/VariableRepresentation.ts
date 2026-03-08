import { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type { Term } from '@rdfjs/types';
import { Constructor } from '@tpluscode/rdfine';
import { hydra } from '../lib/namespace.js';
import { xsd } from '@tpluscode/rdf-ns-builders';
import { VariableRepresentation } from '../lib/VariableRepresentation.js';

interface TemplateValueMapper {
  mapValue(term: Term): string;
}

declare module '@rdfine/hydra' {
  export interface VariableRepresentation extends TemplateValueMapper {
  }
}

export function VariableRepresentationExMixin<Base extends Constructor>(Resource: Base): Constructor<Partial<VariableRepresentation> & RdfResourceCore> & Base {
  class VariableRepresentationClass extends Resource implements Partial<VariableRepresentation>, TemplateValueMapper {
    mapValue(term: Term) {
      if (this.equals(hydra.BasicRepresentation)) {
        return term.value;
      }

      let explicitRepresentation
      switch (term.termType) {
        case 'NamedNode':
          explicitRepresentation = term.value
          break;
        case 'Literal':
          if (!term.datatype || term.datatype.equals(xsd.string)) {
            explicitRepresentation = `"${term.value}"`
          } else if (term.language) {
            explicitRepresentation = `"${term.value}"@${term.language}`
          } else {
            explicitRepresentation = `"${term.value}"^^${term.datatype.value}`
          }
          break;
        default:
          throw new Error(`Cannot use term ${term.termType} for template variable expansion`)
      }

      return decodeURIComponent(explicitRepresentation);
    }
  }
  return VariableRepresentationClass
}

VariableRepresentationExMixin.appliesTo = hydra.VariableRepresentation
