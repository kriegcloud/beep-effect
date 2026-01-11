import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";

// -----------------------------------------------------------------------------
// Type definitions
// -----------------------------------------------------------------------------

type OnSuccessCallback = (responseText: string) => void;
type OnErrorCallback = (error: string | Event) => void;

interface QueryParams {
  readonly [key: string]: string;
}

// -----------------------------------------------------------------------------
// Utils class
// -----------------------------------------------------------------------------

export class Utils {
  static downloadFile(downloadUrl: string, onSuccess: OnSuccessCallback, onError: OnErrorCallback): void {
    console.log(`DownloadFile: ${downloadUrl}`);
    if (downloadUrl) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", downloadUrl);
      xhr.onload = () => {
        if (xhr.status === 200) {
          onSuccess(xhr.responseText);
        } else {
          onError(`${xhr.status} ${xhr.statusText}`);
        }
      };
      xhr.onerror = (e) => {
        console.log(e);
        onError(e);
      };
      xhr.send();
    }
  }

  static getQueryParams(): QueryParams {
    const search = window.location.search.substring(1);
    if (Str.isEmpty(search)) {
      return {};
    }

    const paramsArray = Str.split(search, "&");

    return A.reduce(paramsArray, {} as QueryParams, (acc, param) => {
      const parts = Str.split(param, "=");
      const keyOpt = A.get(parts, 0);
      const valueOpt = A.get(parts, 1);

      if (O.isNone(keyOpt)) {
        return acc;
      }

      const key = keyOpt.value;
      const value = O.match(valueOpt, {
        onNone: () => "",
        onSome: (v) => decodeURIComponent(Str.replaceAll("+", " ")(v)),
      });

      return { ...acc, [key]: value };
    });
  }
}
