export const LoadingScreen = () => {
  return (
    <section
      className="grid min-h-dvh w-full max-w-(--breakpoint-2xl) place-items-center px-4"
      aria-label="Loading screen"
      role="presentation"
    >
      <div
        className="aspect-square w-20 animate-spin rounded-full border-y-4 border-solid border-t-transparent"
        role="progressbar"
      />
    </section>
  );
};
