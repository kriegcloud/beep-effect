I want to create a file upload pipeline which.

- validates the uploaded files
- extracts basic metadata from the uploaded files
- if the files is an image extracts exif metadata

I have some effect/Schema schemas, utility functions & form components  I’ve already created to assist with this.

- Relevant Schema’s and Utility functions:  `packages/common/schema/src/custom/file`
- Exif Metadata Parser: `packages/common/schema/src/custom/file/Exif.schema.ts`
- File Validation:
    - `packages/common/schema/src/custom/file/typeChecker.ts`
    - usage examples: `packages/common/schema/test/custom/file`
- Form Components
    - packages/ui/src/inputs/upload
    - packages/ui/src/inputs/UploadAvatarField.tsx
    - packages/ui/src/inputs/UploadBoxField.tsx
    - packages/ui/src/inputs/UploadField.tsx
    - Usage example with @tanstack/react-from:
        - apps/web/src/features/upload

**Requirements:**

- Pipeline uses error handling utilities defined in `packages/common/errors/src/utils.ts`
- Pipeline is written using the `effect/Effect` module. for example

```tsx
import * as Effect from "effect/Effect";

const validateFile = Effect.fn("validateFile")(function* (params: someparams) {
// implement
});

const extractBasicMetadata = Effect.fn("extractBasicMetadata")(function* (params: someparams) {
// implement
})

const extractExifMetadata = Effect.fn("extractExifMetadata")(function* (params: someparams) {
// implement
})

export class UploadFileService extends Effect.Service<UploadFileService>()(
 "UploadFileService",
 {
   dependencies: [],
   accessors: true
   effect: Effect.gen(function* () {
     // implement
   })
 }
)
```
