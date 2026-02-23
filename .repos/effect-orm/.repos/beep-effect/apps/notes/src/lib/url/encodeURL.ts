export const encodeURL = (pathname: string, search?: undefined | string) => {
  let callbackUrl = pathname;

  if (search) {
    if (!search.startsWith("?")) {
      search = `?${search}`;
    }

    callbackUrl += search;
  }

  return encodeURIComponent(callbackUrl);
};
