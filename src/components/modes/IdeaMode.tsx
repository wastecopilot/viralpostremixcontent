"use client";

import { useState } from "react";
import { Mic, Sparkles, Square } from "lucide-react";
import { COSTS } from "@/config/credits";
import type { TemplateId } from "@/config/templates";
import type { EditorSeed } from "@/components/editor/editorState";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorNote } from "@/components/ui/Notice";
import { cx } from "@/lib/cx";
import { useBrandVoice } from "@/lib/state";
import { useAi } from "@/lib/useAi";
import { useSpeech } from "@/lib/useSpeech";

interface IdeaResult {
  onImageText: string;
  caption: string;
  pinnedComment: string;
  templateId: TemplateId;
  accents: string[];
}

export function IdeaMode({ onDone }: { onDone: (seed: EditorSeed) => void }) {
  const [idea, setIdea] = useState("");
  const { run, busy, error } = useAi();
  const speech = useSpeech();
  const { voice } = useBrandVoice();

  const create = async () => {
    if (speech.listening) speech.stop();
    const data = await run<IdeaResult>("idea", "/api/idea", { idea, brandVoice: voice, audience: null }, COSTS.idea);
    if (!data) return;
    onDone({
      text: data.onImageText,
      templateId: data.templateId,
      accents: data.accents,
      caption: data.caption,
      pinned: data.pinnedComment,
    });
  };

  const toggleMic = () => {
    if (speech.listening) speech.stop();
    else speech.start(idea, setIdea);
  };

  return (
    <Card>
      <CardHeader
        large
        title="What do you want to post about?"
        helper="Type or tap the microphone and speak. Rough notes, a story, an opinion or a news summary all work. You can fix the words before creating."
      />
      <div className="relative">
        <textarea
          aria-label="Your idea"
          rows={5}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g. I finally learned that saying no to small jobs freed up my whole week…"
          className="min-h-36 w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 pr-14 text-[14px] leading-relaxed text-ink shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        <button
          type="button"
          onClick={toggleMic}
          aria-pressed={speech.listening}
          aria-label={speech.listening ? "Stop voice typing" : "Start voice typing"}
          title={speech.listening ? "Stop" : "Speak your idea"}
          className={cx(
            "absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full border transition-colors",
            speech.listening
              ? "animate-pulse border-red-200 bg-red-50 text-red-600"
              : "border-line bg-white text-ink/70 hover:border-accent/50 hover:text-accent",
          )}
        >
          {speech.listening ? <Square className="size-3.5 fill-current" aria-hidden /> : <Mic className="size-4" aria-hidden />}
        </button>
      </div>
      {speech.listening && <p className="mt-1.5 text-[12px] font-medium text-red-600">Listening… tap the square to stop.</p>}
      <ErrorNote className="mt-1.5">{speech.error}</ErrorNote>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          variant="primary"
          size="lg"
          icon={<Sparkles className="size-4" aria-hidden />}
          onClick={create}
          loading={busy === "idea"}
          disabled={!idea.trim() || busy !== null}
        >
          {busy === "idea" ? "Creating…" : "Create post"}
        </Button>
        <p className="text-[12.5px] text-muted">
          Uses 5 credits (on-image text 2, caption 2, pinned comment 1). Choosing a template is free.
        </p>
        <button
          type="button"
          onClick={() => onDone({ text: idea, accents: [] })}
          className="text-[12.5px] font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          I already have my exact on-image text
        </button>
      </div>
      <ErrorNote className="mt-3">{error}</ErrorNote>
    </Card>
  );
}
