export const getNextCursor = <T extends any[]>(items: T, limit: number) => {
  let nextCursor: string | undefined;

  if (items.length > limit) {
    const nextItem = items.pop(); // return the last item from the array
    nextCursor = nextItem?.id;
  }

  return nextCursor;
};
