"use client";
import { useEffect, useState } from "react";

/**
 * Custom hook to determine if the code is running on the client side.
 *
 * @returns {boolean} - Returns true if the code is running on the client side, otherwise false.
 *
 * @example
 * const isClient = useIsClient();
 *
 * return (
 *   <div>
 *     <p>Is Client: {isClient.toString()}</p>
 *   </div>
 * );
 */

export type UseIsClientReturn = boolean;

export function useIsClient(): UseIsClientReturn {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  return isClient;
}
