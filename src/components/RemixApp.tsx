"use client";

import { useCallback, useEffect, useState } from "react";
import { WandSparkles } from "lucide-react";
import { brand } from "@/config/brand";
import { MODES, type ModeId } from "@/config/options";
import { cx } from "@/lib/cx";
import { useHydrated, usePersistent } from "@/lib/store";
import { CreditBar } from "./CreditBar";
import { loadEditor, saveEditor, type EditorSeed, type EditorState } from "./editor/editorState";
import { OwnTextEditor } from "./editor/OwnTextEditor";
import { CaptionImageMode } from "./modes/CaptionImageMode";
import { CaptionRewriteMode } from "./modes/CaptionRewriteMode";
import { IdeaMode } from "./modes/IdeaMode";
import { PinnedCommentMode } from "./modes/PinnedCommentMode";
import { RemixPostMode } from "./modes/RemixPostMode";

export function RemixApp() {
  const hydrated = useHydrated();
  return (
    <main className="mx-auto w-full max-w-[930px] px-4 pt-6 pb-24 sm:pt-8">
      <h1 className="flex items-center gap-2 text-[24px] font-bold tracking-tight text-ink sm:text-[26px]">
        <WandSparkles className="size-6 text-accent" aria-hidden />
        {brand.toolName}
      </h1>
      <p className="mt-1 text-[13.5px] text-muted">{brand.description}</p>
      <div className="mt-5">
        <CreditBar />
      </div>
      {hydrated ? <Workspace /> : <LoadingSkeleton />}
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3" aria-hidden>
      {MODES.map((m) => (
        <div key={m.value} className="h-[62px] animate-pulse rounded-[14px] border border-line bg-white" />
      ))}
    </div>
  );
}

const DEFAULT_MODE: ModeId = "remix";

function Workspace() {
  const [storedMode, setMode] = usePersistent<ModeId>("mode", DEFAULT_MODE);
  const mode: ModeId = MODES.some((m) => m.value === storedMode) ? storedMode : DEFAULT_MODE;
  const [editor, setEditor] = useState<EditorState>(loadEditor);

  // Remember the editor text and settings (saved a moment after you stop typing).
  useEffect(() => {
    const timer = setTimeout(() => saveEditor(editor), 400);
    return () => clearTimeout(timer);
  }, [editor]);

  const openEditor = useCallback(
    (seed: EditorSeed) => {
      setEditor((e) => ({
        ...e,
        text: seed.text,
        templateId: seed.templateId ?? e.templateId,
        accents: seed.accents ?? [],
        cap: { ...e.cap, caption: seed.caption ?? e.cap.caption, pinned: seed.pinned ?? e.cap.pinned },
      }));
      setMode("ownText");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setMode],
  );

  return (
    <>
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3" role="tablist" aria-label="Choose what to make">
        {MODES.map((m) => {
          const selected = m.value === mode;
          return (
            <button
              key={m.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setMode(m.value)}
              className={cx(
                "flex min-h-[62px] flex-col justify-center rounded-[14px] border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                selected
                  ? "border-accent bg-accent-soft shadow-[0_0_0_1px_var(--brand-accent)]"
                  : "border-line bg-[#F6F6F9] hover:border-gray-300 hover:bg-white",
              )}
            >
              <span className={cx("text-[13px] font-semibold", selected ? "text-[#2A1F7A]" : "text-ink")}>{m.label}</span>
              <span className={cx("mt-0.5 text-[12px] leading-snug", selected ? "text-[#4B3FA8]" : "text-muted")}>
                {m.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5" role="tabpanel">
        {mode === "remix" && <RemixPostMode onOpenEditor={openEditor} />}
        {mode === "caption" && <CaptionRewriteMode />}
        {mode === "captionImage" && <CaptionImageMode />}
        {mode === "pinned" && <PinnedCommentMode />}
        {mode === "ownText" && <OwnTextEditor state={editor} setState={setEditor} />}
        {mode === "idea" && <IdeaMode onDone={openEditor} />}
      </div>
    </>
  );
}
