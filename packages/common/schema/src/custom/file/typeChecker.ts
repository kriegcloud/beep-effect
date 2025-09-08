import * as detectionFunctions from "./detection";
import * as validationFunctions from "./validation";

export const fileTypeChecker = {
  ...detectionFunctions,
  ...validationFunctions,
};


