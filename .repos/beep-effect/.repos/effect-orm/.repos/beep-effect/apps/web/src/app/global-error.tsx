"use client";

export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: undefined |  string };
  readonly reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
            padding: "2rem",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Something went wrong!</h2>
          {error.digest && (
            <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1rem" }}>Error ID: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: "pointer",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
