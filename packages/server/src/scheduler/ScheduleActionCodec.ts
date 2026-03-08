import {
  BackgroundAction,
  type BackgroundAction as BackgroundActionModel
} from "@template/domain/ports"
import { sqlJsonColumn } from "../persistence/SqlCodecs.js"

const backgroundActionJson = sqlJsonColumn(BackgroundAction)

export const encodeBackgroundActionPayloadJson = (action: BackgroundActionModel): string =>
  backgroundActionJson.encode(action)

export const decodeBackgroundActionPayloadJson = (
  payloadJson: string
): BackgroundActionModel | null => {
  try {
    return backgroundActionJson.decode(payloadJson)
  } catch {
    return null
  }
}
