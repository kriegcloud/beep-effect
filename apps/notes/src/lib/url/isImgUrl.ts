/** Check if a url contains a valid image by sending a HEAD request. */
export const isImgUrl = async (url: string) =>
  fetch(url, { method: "HEAD" })
    .then((res) => {
      return res.headers.get("Content-Type")?.startsWith("image");
    })
    .catch(() => false);
