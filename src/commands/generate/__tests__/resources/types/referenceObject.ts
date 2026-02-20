import { IOtherObject } from "../other/otherObject";
import { ISomeObject } from "./someObject";

export interface IReferenceObject {
    'differentPackage': IOtherObject;
    'samePackage': ISomeObject;
}
