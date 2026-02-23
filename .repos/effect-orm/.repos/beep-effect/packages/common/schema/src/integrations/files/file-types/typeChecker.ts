import * as detectionFunctions from "./detection";
import * as validationFunctions from "./FileTypes";

export const fileTypeChecker = {
  ...detectionFunctions,
  ...validationFunctions,
};
