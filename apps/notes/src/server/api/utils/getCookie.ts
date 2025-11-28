export type RequestCookie = { name: string; value: string };

export const getCookie = (cookies: RequestCookie[] | undefined, name: string) => {
  return cookies?.find((cookie) => cookie.name === name)?.value;
};

export const getCookieNumber = (cookies: RequestCookie[] | undefined, name: string) => {
  const cookie = getCookie(cookies, name);

  if (!cookie) return;

  return Number.parseInt(cookie, 10);
};
