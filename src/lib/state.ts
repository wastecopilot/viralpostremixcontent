"use client";

// Everything the app remembers in the browser: credits, profiles, avatars,
// brand voice, saved posts and the download counter.

import { useCallback, useSyncExternalStore } from "react";
import { FREE_DOWNLOADS, FREE_IMAGE_EVERY_HOURS, STARTING_CREDITS } from "@/config/credits";
import type { BadgeOption } from "@/config/options";
import { newId, readValue, usePersistent } from "./store";

// ── Credits ─────────────────────────────────────────────────

export function useCredits() {
  const [credits, setCredits] = usePersistent<number>("credits", STARTING_CREDITS);
  /** Takes credits away. Returns false if there are not enough. */
  const spend = useCallback(
    (amount: number): boolean => {
      if (amount <= 0) return true;
      if (readValue("credits", STARTING_CREDITS) < amount) return false;
      setCredits((prev) => Math.max(0, prev - amount));
      return true;
    },
    [setCredits],
  );
  const reset = useCallback(() => setCredits(STARTING_CREDITS), [setCredits]);
  return { credits, spend, reset };
}

export function currentCredits(): number {
  return readValue("credits", STARTING_CREDITS);
}

// ── Downloads ───────────────────────────────────────────────

export function useDownloads() {
  const [used, setUsed] = usePersistent<number>("downloadsUsed", 0);
  const remaining = Math.max(0, FREE_DOWNLOADS - used);
  const useOne = useCallback((): boolean => {
    if (readValue("downloadsUsed", 0) >= FREE_DOWNLOADS) return false;
    setUsed((prev) => prev + 1);
    return true;
  }, [setUsed]);
  const reset = useCallback(() => setUsed(0), [setUsed]);
  return { remaining, useOne, reset };
}

// ── A clock that ticks every 15 seconds (for countdowns) ────

let nowValue = 0;
let nowTimer: ReturnType<typeof setInterval> | null = null;
const nowListeners = new Set<() => void>();

function subscribeNow(listener: () => void) {
  nowListeners.add(listener);
  if (!nowTimer) {
    nowValue = Date.now();
    nowTimer = setInterval(() => {
      nowValue = Date.now();
      nowListeners.forEach((l) => l());
    }, 15_000);
  }
  return () => {
    nowListeners.delete(listener);
    if (nowListeners.size === 0 && nowTimer) {
      clearInterval(nowTimer);
      nowTimer = null;
    }
  };
}

function getNow() {
  if (nowValue === 0) nowValue = Date.now();
  return nowValue;
}

export function useNow(): number {
  return useSyncExternalStore(subscribeNow, getNow, () => 0);
}

// ── One free AI image every few hours ───────────────────────

const FREE_IMAGE_MS = FREE_IMAGE_EVERY_HOURS * 60 * 60 * 1000;

export function useFreeImage() {
  const [usedAt, setUsedAt] = usePersistent<number | null>("freeImageUsedAt", null);
  const now = useNow();
  const nextFreeAt = usedAt ? usedAt + FREE_IMAGE_MS : 0;
  const isFree = now > 0 && now >= nextFreeAt;
  const msLeft = Math.max(0, nextFreeAt - now);
  const hours = Math.floor(msLeft / 3_600_000);
  const minutes = Math.ceil((msLeft % 3_600_000) / 60_000);
  const countdown = isFree
    ? "Free AI image available now"
    : `Free AI image available in ${minutes === 60 ? hours + 1 : hours}h ${minutes === 60 ? 0 : minutes}m`;
  const markUsed = useCallback(() => setUsedAt(Date.now()), [setUsedAt]);
  return { isFree, countdown, markUsed };
}

// ── Image profiles (your photo, name and handle) ────────────

export interface Profile {
  id: string;
  label: string;
  name: string;
  handle: string;
  /** Small JPEG data URL, or null. */
  photo: string | null;
}

export interface IdentitySettings {
  showUsername: boolean;
  badge: BadgeOption;
}

const NO_PROFILES: Profile[] = [];
const DEFAULT_IDENTITY_SETTINGS: IdentitySettings = { showUsername: true, badge: "off" };

export function useIdentity() {
  const [profiles, setProfiles] = usePersistent<Profile[]>("profiles", NO_PROFILES);
  const [activeId, setActiveId] = usePersistent<string | null>("activeProfile", null);
  const [settings, setSettingsRaw] = usePersistent<IdentitySettings>("identitySettings", DEFAULT_IDENTITY_SETTINGS);

  const active = profiles.find((p) => p.id === activeId) ?? null;

  /** Updates the photo/name/handle. Creates a profile automatically the first time. */
  const updateFields = useCallback(
    (fields: Partial<Pick<Profile, "name" | "handle" | "photo">>): boolean => {
      const list = readValue<Profile[]>("profiles", NO_PROFILES);
      const currentId = readValue<string | null>("activeProfile", null);
      const current = list.find((p) => p.id === currentId);
      if (!current) {
        const created: Profile = { id: newId(), label: "Untitled profile", name: "", handle: "", photo: null, ...fields };
        const ok = setProfiles([...list, created]);
        if (ok) setActiveId(created.id);
        return ok;
      }
      return setProfiles(list.map((p) => (p.id === current.id ? { ...p, ...fields } : p)));
    },
    [setProfiles, setActiveId],
  );

  const saveAsNew = useCallback((): boolean => {
    const list = readValue<Profile[]>("profiles", NO_PROFILES);
    const currentId = readValue<string | null>("activeProfile", null);
    const current = list.find((p) => p.id === currentId);
    const copy: Profile = current
      ? { ...current, id: newId(), label: `${current.label} (copy)` }
      : { id: newId(), label: "Untitled profile", name: "", handle: "", photo: null };
    const ok = setProfiles([...list, copy]);
    if (ok) setActiveId(copy.id);
    return ok;
  }, [setProfiles, setActiveId]);

  const select = useCallback((id: string) => setActiveId(id), [setActiveId]);

  const rename = useCallback(
    (id: string, label: string) =>
      setProfiles((list) => list.map((p) => (p.id === id ? { ...p, label: label.trim() || "Untitled profile" } : p))),
    [setProfiles],
  );

  const remove = useCallback(
    (id: string) => {
      const list = readValue<Profile[]>("profiles", NO_PROFILES).filter((p) => p.id !== id);
      setProfiles(list);
      if (readValue<string | null>("activeProfile", null) === id) setActiveId(list[0]?.id ?? null);
    },
    [setProfiles, setActiveId],
  );

  const setSettings = useCallback(
    (patch: Partial<IdentitySettings>) => setSettingsRaw((prev) => ({ ...prev, ...patch })),
    [setSettingsRaw],
  );

  return {
    profiles,
    active,
    name: active?.name ?? "",
    handle: active?.handle ?? "",
    photo: active?.photo ?? null,
    settings,
    updateFields,
    saveAsNew,
    select,
    rename,
    remove,
    setSettings,
  };
}

export type IdentityApi = ReturnType<typeof useIdentity>;

// ── Audience avatars ("Who are we talking to?") ─────────────

export interface Audience {
  id: string;
  name: string;
  who: string;
  problem: string;
  tone: string;
}

const NO_AUDIENCES: Audience[] = [];

export function useAudiences() {
  const [audiences, setAudiences] = usePersistent<Audience[]>("audiences", NO_AUDIENCES);
  const save = useCallback(
    (audience: Omit<Audience, "id"> & { id?: string }): string => {
      const id = audience.id ?? newId();
      setAudiences((list) => {
        const exists = list.some((a) => a.id === id);
        const item: Audience = { ...audience, id };
        return exists ? list.map((a) => (a.id === id ? item : a)) : [...list, item];
      });
      return id;
    },
    [setAudiences],
  );
  const remove = useCallback((id: string) => setAudiences((list) => list.filter((a) => a.id !== id)), [setAudiences]);
  return { audiences, save, remove };
}

// ── Brand voice ─────────────────────────────────────────────

export function useBrandVoice() {
  const [voice, setVoice] = usePersistent<string>("brandVoice", "");
  return { voice, setVoice };
}

// ── Saved posts ("All Content") ─────────────────────────────

export interface SavedPost {
  id: string;
  createdAt: number;
  /** JPEG data URL of the finished graphic. */
  image: string;
  /** PNG export size, used when downloading again. */
  width: number;
  height: number;
  text: string;
  caption: string;
  pinnedComment: string;
  style: string;
}

const NO_POSTS: SavedPost[] = [];

export function useSavedPosts() {
  const [posts, setPosts] = usePersistent<SavedPost[]>("posts", NO_POSTS);
  /** Returns false when the browser storage is full. */
  const add = useCallback(
    (post: Omit<SavedPost, "id" | "createdAt">): boolean =>
      setPosts((list) => [{ ...post, id: newId(), createdAt: Date.now() }, ...list]),
    [setPosts],
  );
  const remove = useCallback((id: string) => setPosts((list) => list.filter((p) => p.id !== id)), [setPosts]);
  return { posts, add, remove };
}

// ── Demo mode (no Gemini key yet) ───────────────────────────

let demoValue: boolean | null = null;
let demoRequest: Promise<void> | null = null;
const demoListeners = new Set<() => void>();

function subscribeDemo(listener: () => void) {
  demoListeners.add(listener);
  if (!demoRequest) {
    demoRequest = fetch("/api/status", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ demo?: boolean }>)
      .then((data) => {
        demoValue = Boolean(data.demo);
      })
      .catch(() => {
        demoValue = null;
      })
      .finally(() => demoListeners.forEach((l) => l()));
  }
  return () => {
    demoListeners.delete(listener);
  };
}

/** true = demo mode, false = real AI, null = still checking. */
export function useDemoMode(): boolean | null {
  return useSyncExternalStore(
    subscribeDemo,
    () => demoValue,
    () => null,
  );
}
