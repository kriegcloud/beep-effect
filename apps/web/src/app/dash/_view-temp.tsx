"use client";
import { client } from "@beep/iam-sdk/adapters/better-auth";
import { IamError } from "@beep/iam-sdk/errors";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { Markdown } from "@beep/ui/data-display";
import { Editor } from "@beep/ui/inputs/editor";
import { ComponentLayout } from "@beep/ui/layouts/component-layout";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import React from "react";

const runtime = makeAtomRuntime(Layer.empty);

const listSessionsAtom = runtime.atom(
  Effect.tryPromise({
    try: () => client.listSessions(),
    catch: (e) => IamError.match(e),
  })
);

const codeBlock = `
<pre><code class="language-json">[
      {
        "expiresAt": "2025-10-19T06:21:35.418Z",
        "token": "wbisQnIVYVIdFztYmiovDdwPb7PZ3jvU",
        "createdAt": "2025-10-18T06:21:35.420Z",
        "updatedAt": "2025-10-18T06:21:35.420Z",
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        "userId": "user__bce638eb-1303-4df9-b61f-be32a4c398b1",
        "impersonatedBy": null,
        "activeOrganizationId": "organization__3f94ec4b-87f5-454a-9a52-ec3d767513ec",
        "activeTeamId": null,
        "_rowId": 1,
        "deletedAt": null,
        "createdBy": null,
        "updatedBy": null,
        "deletedBy": null,
        "version": 1,
        "source": null,
        "id": "session__518adb05-3ca5-40da-aeb7-9115435ba66e"
      },
      {
        "expiresAt": "2025-10-19T06:24:53.937Z",
        "token": "A6LNtDNaxg88GaLD9dVtRu1gZ7ahD5Zb",
        "createdAt": "2025-10-18T06:24:53.938Z",
        "updatedAt": "2025-10-18T06:24:53.938Z",
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        "userId": "user__bce638eb-1303-4df9-b61f-be32a4c398b1",
        "impersonatedBy": null,
        "activeOrganizationId": "organization__3f94ec4b-87f5-454a-9a52-ec3d767513ec",
        "activeTeamId": null,
        "_rowId": 2,
        "deletedAt": null,
        "createdBy": null,
        "updatedBy": null,
        "deletedBy": null,
        "version": 1,
        "source": null,
        "id": "session__56f9ebc7-e4ca-402f-9ff4-44ce9ac57192"
      }
    ]</code></pre>
`;

const defaultValue = `
<h4>This is Heading 4</h4>
<p>
  <strong>Lorem Ipsum</strong> is simply <em>dummy</em> text of the <u>printing</u> and <s>typesetting</s> industry. Lorem Ipsum has been the <a target="_blank" rel="noopener noreferrer nofollow" class="minimal__editor__content__link" href="https://www.google.com/">industry's</a> standard dummy text ever since the 1500s, when an <strong>
    <span style="text-transform: uppercase;">unknown</span>
  </strong> printer took a <span style="text-transform: capitalize;">galley</span> of type and scrambled it to make a type specimen book.
</p>
<code>This is code</code>
${codeBlock}
`;

export const ViewTemp = () => {
  // const {data: session} = client.useSession();
  const [checked, setChecked] = React.useState(true);
  const [content, setContent] = React.useState(defaultValue);
  const listSessionsResult = useAtomValue(listSessionsAtom);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  }, []);

  React.useEffect(() => {
    if (listSessionsResult) {
      console.log(JSON.stringify(listSessionsResult, null, 2));
    }
  }, [listSessionsResult]);

  return (
    <ComponentLayout
      heroProps={{
        heading: "Editor",
        moreLinks: ["https://tiptap.dev/docs/editor/introduction"],
      }}
      containerProps={{ maxWidth: false }}
    >
      <FormControlLabel
        control={<Switch name="fullItem" checked={checked} onChange={handleChange} />}
        label="Full item"
        sx={{ mb: 3 }}
      />
      <Box
        sx={{
          rowGap: 5,
          columnGap: 3,
          display: "grid",
          alignItems: "flex-start",
          gridTemplateColumns: { xs: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" },
        }}
      >
        <Editor fullItem={checked} value={content} onChange={(value) => setContent(value)} sx={{ maxHeight: 720 }} />
        {Result.builder(listSessionsResult)
          .onInitial(() => <>Loading</>)
          .onErrorTag("IamError", () => <>An Error occurred listing the sessions</>)
          .onDefect(() => <>An unknown Error occurred</>)
          .onSuccess(() => (
            <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: "background.neutral" }}>
              <Box
                sx={[
                  (theme) => ({
                    px: 3,
                    py: 3.75,
                    typography: "h6",
                    bgcolor: "background.paper",
                    borderTopLeftRadius: "inherit",
                    borderTopRightRadius: "inherit",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }),
                ]}
              >
                Preview
              </Box>
              <Markdown children={content} sx={{ px: 3 }} />
            </Paper>
          ))
          .render()}
      </Box>
    </ComponentLayout>
  );
};
