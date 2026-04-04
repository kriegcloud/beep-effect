export const stringReplaceAll = (text: string, substring: string, replacer: string): string => {
  let index = text.indexOf(substring);

  if (index === -1) {
    return text;
  }

  const substringLength = substring.length;
  let endIndex = 0;
  let result = "";

  do {
    result += text.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = text.indexOf(substring, endIndex);
  } while (index !== -1);

  result += text.slice(endIndex);

  return result;
};

export const stringEncaseCRLFWithFirstIndex = (
  text: string,
  prefix: string,
  postfix: string,
  index: number
): string => {
  let endIndex = 0;
  let result = "";
  let nextIndex = index;

  do {
    const gotCR = text[nextIndex - 1] === "\r";

    result += text.slice(endIndex, gotCR ? nextIndex - 1 : nextIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = nextIndex + 1;
    nextIndex = text.indexOf("\n", endIndex);
  } while (nextIndex !== -1);

  result += text.slice(endIndex);

  return result;
};
