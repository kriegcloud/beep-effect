import { schema } from './namespace.js';

const values = {
  Abdomen: schema.Abdomen,
  Appearance: schema.Appearance,
  CardiovascularExam: schema.CardiovascularExam,
  Ear: schema.Ear,
  Eye: schema.Eye,
  Genitourinary: schema.Genitourinary,
  Head: schema.Head,
  Lung: schema.Lung,
  MusculoskeletalExam: schema.MusculoskeletalExam,
  Neck: schema.Neck,
  Neuro: schema.Neuro,
  Nose: schema.Nose,
  Skin: schema.Skin,
  Throat: schema.Throat,
};

export type PhysicalExam = typeof values[keyof typeof values];

export default values;
