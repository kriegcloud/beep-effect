import { SchemaFactory } from '../Factory.js'
import Environment from '@zazuko/env/Environment.js';
import parent from '@rdfine/env';

export default new Environment([SchemaFactory], { parent })
