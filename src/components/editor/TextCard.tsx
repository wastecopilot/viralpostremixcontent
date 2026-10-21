"use client";

import { useState } from "react";
import { Layers, Settings2, Sparkles, Users } from "lucide-react";
import { COSTS } from "@/config/credits";
import { TEXT_DIRECTIONS } from "@/config/options";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextArea } from "@/components/ui/Inputs";
import { DemoBadge, ErrorNote } from "@/components/ui/Notice";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { useAudiences, useBrandVoice } from "@/lib/state";
import { accentsInText } from "@/lib/text";
import { useAi } from "@/lib/useAi";
import { AudienceModal } from "./AudienceModal";
import type { EditorState } from "./editorState";

interface Version {
  text: string;
  accents: string[];
}

export function TextCard({ state, patch }: { state: EditorState; patch: (p: Partial<EditorState>) => void }) {
  const { voice } = useBrandVoice();
  const { audiences } = useAudiences();
  const { run, busy, error } = useAi();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [audienceModal, setAudienceModal] = useState<null | "manage" | "new">(null);
  const [versions, setVersions] = useState<{ list: Version[]; demo: boolean } | null>(null);

  const audience = audiences.find((a) => a.id === state.audienceId) ?? null;
  const aiBody = (action: "improve" | "versions") => ({
    action,
    text: state.text,
    direction: state.direction,
    brandVoice: state.useBrandVoice ? voice : "",
    audience: audience ? { name: audience.name, who: audience.who, problem: audience.problem, tone: audience.tone } : null,
  });

  const apply = (v: Version) => {
    patch({ text: v.text, accents: state.autoSuggest ? v.accents : accentsInText(state.accents, v.text) });
  };

  const improve = async () => {
    const data = await run<{ versions: Version[] }>("improve", "/api/text", aiBody("improve"), COSTS.improveText);
    if (data?.versions[0]) {
      apply(data.versions[0]);
      setVersions(null);
    }
  };

  const showVersions = async () => {
    const data = await run<{ versions: Version[] }>("versions", "/api/text", aiBody("versions"), COSTS.textVersions);
    if (data) setVersions({ list: data.versions, demo: Boolean(data.demo) });
  };

  const hasText = state.text.trim().length > 0;

  return (
    <Card>
      <CardHeader
        title="Text"
        className="mb-3"
        right={
          <Toggle
            checked={state.autoLayout}
            onChange={(autoLayout) => patch({ autoLayout })}
            label={<span className="text-[12.5px] text-muted">Auto layout</span>}
            title="Groups your name and text together and centers them"
          />
        }
      />
      <TextArea
        aria-label="Graphic text"
        rows={4}
        value={state.text}
        onChange={(e) => patch({ text: e.target.value })}
        placeholder="A sentence, a rough thought, a question, a short story or a headline"
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-medium whitespace-nowrap text-ink/80">Direction (optional)</span>
          <Select
            size="sm"
            ariaLabel="Direction"
            className="w-44"
            value={state.direction}
            options={TEXT_DIRECTIONS}
            onChange={(direction) => patch({ direction })}
          />
        </div>
        <div className="flex items-center gap-1">
          <Toggle
            checked={state.useBrandVoice}
            onChange={(on) => {
              patch({ useBrandVoice: on });
              if (on && !voice.trim()) setVoiceOpen(true);
            }}
            label={<span className="text-[12.5px]">Use Brand Voice</span>}
          />
          {state.useBrandVoice && (
            <button
              type="button"
              onClick={() => setVoiceOpen((o) => !o)}
              aria-label="Edit brand voice"
              title="Edit brand voice"
              className="rounded-md p-1 text-muted hover:bg-gray-100 hover:text-ink"
            >
              <Settings2 className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
        <Button
          size="sm"
          icon={<Sparkles className="size-3.5" aria-hidden />}
          onClick={improve}
          loading={busy === "improve"}
          disabled={!hasText || busy !== null}
        >
          Improve with AI
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Layers className="size-3.5" aria-hidden />}
          onClick={showVersions}
          loading={busy === "versions"}
          disabled={!hasText || busy !== null}
          cost={COSTS.textVersions}
        >
          Show me 3 versions
        </Button>
      </div>

      {voiceOpen && <BrandVoiceBox onClose={() => setVoiceOpen(false)} />}
      <ErrorNote className="mt-2">{error}</ErrorNote>

      {versions && (
        <div className="animate-fade-in mt-3 space-y-2 rounded-2xl border border-line bg-[#FAFAFC] p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              Pick a version <DemoBadge show={versions.demo} />
            </span>
            <button type="button" onClick={() => setVersions(null)} className="text-[12px] text-muted hover:text-ink">
              Close
            </button>
          </div>
          {versions.list.map((v, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3">
              <p className="text-[13.5px] whitespace-pre-wrap text-ink">{v.text}</p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  apply(v);
                  setVersions(null);
                }}
              >
                Use this
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <Users className="size-4 text-ink/70" aria-hidden />
            Who are we talking to?
          </span>
          <button type="button" onClick={() => setAudienceModal("manage")} className="text-[12px] font-medium text-accent hover:underline">
            Manage avatars
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip selected={state.audienceId === null || !audience} onClick={() => patch({ audienceId: null })}>
            No specific avatar
          </Chip>
          {audiences.map((a) => (
            <Chip key={a.id} selected={state.audienceId === a.id} onClick={() => patch({ audienceId: a.id })}>
              {a.name}
            </Chip>
          ))}
        </div>
        {audiences.length === 0 && (
          <p className="mt-2 text-[12px] text-muted">
            No avatars yet — content stays written for your general audience.{" "}
            <button type="button" onClick={() => setAudienceModal("new")} className="font-medium text-accent hover:underline">
              Build one.
            </button>
          </p>
        )}
      </div>

      {audienceModal && (
        <AudienceModal
          key={audienceModal}
          startNew={audienceModal === "new"}
          onClose={() => setAudienceModal(null)}
          onSaved={(id) => patch({ audienceId: id })}
        />
      )}
    </Card>
  );
}

function BrandVoiceBox({ onClose }: { onClose: () => void }) {
  const { voice, setVoice } = useBrandVoice();
  const [draft, setDraft] = useState(voice);
  return (
    <div className="animate-fade-in mt-3 rounded-2xl border border-accent/30 bg-accent-soft/40 p-3">
      <label htmlFor="brand-voice" className="text-[12.5px] font-semibold text-ink">
        Your brand voice
      </label>
      <p className="mb-2 text-[12px] text-muted">Describe how you sound. The AI follows this when it writes. Saved on this device.</p>
      <TextArea
        id="brand-voice"
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="e.g. Friendly and plain-spoken. Short sentences. A little humour. Never salesy. I say 'folks', not 'guys'."
        className="bg-white"
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setVoice(draft.trim());
            onClose();
          }}
        >
          Save voice
        </Button>
      </div>
    </div>
  );
}
