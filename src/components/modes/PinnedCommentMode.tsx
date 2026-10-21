"use client";

import { useState } from "react";
import { Layers, MessageSquare } from "lucide-react";
import { COSTS } from "@/config/credits";
import { PINNED_GOALS, type PinnedGoal } from "@/config/options";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, FieldLabel } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { TextArea } from "@/components/ui/Inputs";
import { DemoBadge, ErrorNote } from "@/components/ui/Notice";
import { useAi } from "@/lib/useAi";

export function PinnedCommentMode() {
  const [context, setContext] = useState("");
  const [source, setSource] = useState("");
  const [goal, setGoal] = useState<PinnedGoal>("engagement");
  const [result, setResult] = useState<{ comments: string[]; demo: boolean } | null>(null);
  const { run, busy, error } = useAi();

  const create = async (count: 1 | 3) => {
    const cost = count === 3 ? COSTS.pinnedVersions : COSTS.pinnedComment;
    const data = await run<{ comments: string[] }>(count === 3 ? "versions" : "create", "/api/pinned-comment", { context, source, goal, count }, cost);
    if (data) setResult({ comments: data.comments, demo: Boolean(data.demo) });
  };

  const ready = source.trim().length > 0 && busy === null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          icon={<MessageSquare className="size-4 text-ink/80" aria-hidden />}
          title="Create pinned comment"
          helper="Paste a top Reddit comment or any statement. It becomes a second hook under your post, in fresh words, without claiming someone else's story."
        />
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="pc-context" hint="(recommended)">
              Post context
            </FieldLabel>
            <TextArea
              id="pc-context"
              rows={2}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Your post headline, caption or subject"
            />
          </div>
          <div>
            <FieldLabel htmlFor="pc-source">Source comment / statement</FieldLabel>
            <TextArea
              id="pc-source"
              rows={3}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Paste the comment you want to turn into your pinned comment"
            />
          </div>
          <ChipGroup label="Goal" options={PINNED_GOALS} value={goal} onChange={setGoal} />
          <Button variant="primary" onClick={() => create(1)} loading={busy === "create"} disabled={!ready}>
            Create pinned comment · 1 credit
          </Button>
          <ErrorNote>{error}</ErrorNote>
        </div>
      </Card>

      {result && (
        <Card className="animate-fade-in">
          <CardHeader
            icon={<MessageSquare className="size-4 text-ink/80" aria-hidden />}
            title={
              <span className="flex items-center gap-2">
                {result.comments.length > 1 ? "3 pinned comment options" : "Your pinned comment"}
                <DemoBadge show={result.demo} />
              </span>
            }
            helper="Post it as the first comment under your post, then pin it."
          />
          <div className="space-y-3">
            {result.comments.map((comment, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border border-line bg-[#FCFCFD] p-4 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap text-ink">{comment}</p>
                <CopyButton text={comment} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              icon={<Layers className="size-4" aria-hidden />}
              onClick={() => create(3)}
              loading={busy === "versions"}
              disabled={!ready}
              cost={COSTS.pinnedVersions}
            >
              Give me 3 versions
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
