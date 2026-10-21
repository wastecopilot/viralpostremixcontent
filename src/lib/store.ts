"use client";

// A tiny "save in the browser" helper built on localStorage.
// Every component that uses the same key sees the same value and updates together.

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();
const PREFIX = "contentremix.";

function fullKey(key: string): string {
  return PREFIX + key;
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(fullKey(key));
  } catch {
    return null;
  }
}

export function readValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = readRaw(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

/** Saves a value. Returns false if the browser storage is full. */
export function writeValue<T>(key: string, value: T): boolean {
  try {
    const raw = JSON.stringify(value);
    window.localStorage.setItem(fullKey(key), raw);
    cache.set(key, { raw, value });
    notify(key);
    return true;
  } catch {
    return false;
  }
}

function subscribe(key: string, listener: Listener): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === fullKey(key)) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    set.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Like useState, but the value is kept in localStorage.
 * IMPORTANT: `fallback` must be a constant defined outside the component.
 */
export function usePersistent<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => boolean] {
  const value = useSyncExternalStore(
    useCallback((listener: Listener) => subscribe(key, listener), [key]),
    () => readValue(key, fallback),
    () => fallback,
  );
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readValue(key, fallback);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      return writeValue(key, resolved);
    },
    [key, fallback],
  );
  return [value, setValue];
}

/** True after the page has loaded in the browser (false during server rendering). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function noopSubscribe(): () => void {
  return () => {};
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
