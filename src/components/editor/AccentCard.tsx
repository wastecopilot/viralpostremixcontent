"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { COSTS } from "@/config/credits";
import { ACCENT_COLORS } from "@/config/options";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorNote } from "@/components/ui/Notice";
import { Toggle } from "@/components/ui/Toggle";
import { cx } from "@/lib/cx";
import { isAccented, toggleAccent } from "@/lib/text";
import { useAi } from "@/lib/useAi";
import type { EditorState } from "./editorState";

export function AccentCard({
  state,
  patch,
  locked,
}: {
  state: EditorState;
  patch: (p: Partial<EditorState>) => void;
  /** Breaking News: accents are always yellow and the label can't be accented. */
  locked: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const { run, busy, error } = useAi();
  const hasText = state.text.trim().length > 0;

  const suggest = async () => {
    const data = await run<{ accents: string[] }>("accents", "/api/text", { action: "accents", text: state.text }, COSTS.suggestAccents);
    if (data) patch({ accents: data.accents });
  };

  const tokens = state.text.split(/(\s+)/);

  return (
    <Card>
      <CardHeader
        title="Accent words"
        className="mb-2"
        right={
          <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)} disabled={!hasText && !editing}>
            {editing ? "Done" : "Edit emphasis"}
          </Button>
        }
      />

      {editing ? (
        <div>
          <p className="mb-2 text-[12px] text-muted">Tap words to mark or unmark them.</p>
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-[#FAFAFC] p-3">
            {tokens.map((token, i) => {
              if (!token.trim()) return token.includes("\n") ? <span key={i} className="basis-full" /> : null;
              const on = isAccented(token, state.accents);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() => patch({ accents: toggleAccent(token, state.accents) })}
                  className={cx(
                    "rounded-md border px-1.5 py-0.5 text-[13px] transition-colors",
                    on ? "border-accent bg-accent-soft font-semibold text-accent" : "border-transparent bg-white text-ink hover:border-gray-300",
                  )}
                >
                  {token}
                </button>
              );
            })}
          </div>
        </div>
      ) : state.accents.length === 0 ? (
        <p className="text-[12.5px] text-muted">None yet. Improve with AI suggests some, or tap Edit emphasis.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {state.accents.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent-soft py-0.5 pr-1 pl-2.5 text-[12.5px] font-medium text-accent">
              {a}
              <button
                type="button"
                onClick={() => patch({ accents: state.accents.filter((x) => x !== a) })}
                aria-label={`Remove accent ${a}`}
                className="rounded-full p-0.5 hover:bg-white"
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-gray-300 p-2.5">
        <Button
          size="sm"
          icon={<Sparkles className="size-3.5" aria-hidden />}
          onClick={suggest}
          loading={busy === "accents"}
          disabled={!hasText || busy !== null}
        >
          Suggest accents with AI <span className="font-normal text-muted">· 1 credit</span>
        </Button>
        <Toggle
          checked={state.autoSuggest}
          onChange={(autoSuggest) => patch({ autoSuggest })}
          label={<span className="text-[12.5px] text-muted">Auto-suggest</span>}
          title="When on, AI text buttons also pick accent words for you"
        />
      </div>
      <ErrorNote className="mt-2">{error}</ErrorNote>

      <p className="mt-2.5 text-[12px] text-muted">
        {locked
          ? "Selected words are yellow. BREAKING NEWS stays locked."
          : "Accent words are drawn bold in your accent colour. Emphasis is visual only and never marks a claim as verified."}
      </p>

      {!locked && (
        <div className="mt-3 flex items-center gap-2.5" role="radiogroup" aria-label="Accent colour">
          {ACCENT_COLORS.map((c) => {
            const selected = state.accentColor === c.value;
            const isHighlight = c.value === "highlight";
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={c.label}
                title={c.label}
                onClick={() => patch({ accentColor: c.value })}
                className={cx(
                  "transition-transform hover:scale-105",
                  isHighlight ? "h-5 w-7 rounded-[4px] border border-gray-300" : "size-6 rounded-full",
                  selected && "ring-2 ring-ink ring-offset-2",
                )}
                style={{ background: isHighlight ? c.onLight : c.onDark }}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
