export const hasSpecialProtocol = (url: string) => {
  return /^mailto:|tel:/.test(url);
};
