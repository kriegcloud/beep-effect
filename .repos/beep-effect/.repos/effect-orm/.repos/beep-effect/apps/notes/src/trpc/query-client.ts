import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

let clientQueryClientSingleton: QueryClient | undefined;

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (error) => {
          if (error.message.includes("limit")) {
            toast.error("Rate limit exceeded. Please try again later.");
          } else {
            console.error(error);
          }
        },
      },
      queries: {
        refetchInterval: false,
        refetchOnMount: true, // true
        refetchOnReconnect: false, // true
        refetchOnWindowFocus: false, // true
        retry: false,
        // refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        // retry: process.env.NODE_ENV === 'production',
        staleTime: 0, // 0
      },
    },
  });

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  // This is very important so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  return (clientQueryClientSingleton ??= createQueryClient());
};
