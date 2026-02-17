import { FetchHttpClient } from "@effect/platform"
import { AtomHttpApi } from "@effect-atom/atom-react"

import { LinkPreviewApi } from "@hazel/link-preview-worker"

export class LinkPreviewClient extends AtomHttpApi.Tag<LinkPreviewClient>()("LinkPreviewClient", {
	api: LinkPreviewApi,
	httpClient: FetchHttpClient.layer,
	baseUrl: "https://link-preview.hazel.sh",
}) {}
