"use client";

// One hook for every AI button: checks credits, shows a spinner, calls the
// server, takes the credits only when it worked, and keeps a friendly error.

import { useCallback, useState } from "react";
import { callApi } from "./api";
import { currentCredits, useCredits } from "./state";

export function useAi() {
  const { spend } = useCredits();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(key: string, path: string, body: unknown, cost: number): Promise<(T & { demo?: boolean }) | null> => {
      const credits = currentCredits();
      if (cost > 0 && credits < cost) {
        setError(
          credits === 0
            ? "You're out of free AI credits. Manual editing and PNG export still work."
            : `This needs ${cost} credits, but you have ${credits} left.`,
        );
        return null;
      }
      setBusy(key);
      setError(null);
      try {
        const data = await callApi<T>(path, body);
        spend(cost);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        return null;
      } finally {
        setBusy(null);
      }
    },
    [spend],
  );

  return { run, busy, error, setError };
}
