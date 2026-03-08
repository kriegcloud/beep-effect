import { schema } from './namespace.js';

const values = {
  Bacteria: schema.Bacteria,
  Fungus: schema.Fungus,
  MulticellularParasite: schema.MulticellularParasite,
  Prion: schema.Prion,
  Protozoa: schema.Protozoa,
  Virus: schema.Virus,
};

export type InfectiousAgentClass = typeof values[keyof typeof values];

export default values;
