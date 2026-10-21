"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/Card";
import { TextArea, TextInput } from "@/components/ui/Inputs";
import { Modal } from "@/components/ui/Modal";
import { useAudiences, type Audience } from "@/lib/state";

type Draft = Omit<Audience, "id"> & { id?: string };
const EMPTY: Draft = { name: "", who: "", problem: "", tone: "" };

/** Build and manage "avatars": the people your content talks to. */
export function AudienceModal({
  startNew,
  onClose,
  onSaved,
}: {
  startNew: boolean;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { audiences, save, remove } = useAudiences();
  const [draft, setDraft] = useState<Draft | null>(startNew || audiences.length === 0 ? EMPTY : null);

  const submit = () => {
    if (!draft || !draft.name.trim()) return;
    const id = save({ ...draft, name: draft.name.trim() });
    onSaved(id);
    setDraft(null);
  };

  return (
    <Modal open onClose={onClose} title={draft ? (draft.id ? "Edit avatar" : "Build an avatar") : "Manage avatars"}>
      {draft ? (
        <div className="space-y-3">
          <p className="text-[12.5px] text-muted">
            An avatar is the one kind of person you want to reach. The AI writes with them in mind.
          </p>
          <div>
            <FieldLabel htmlFor="av-name">Name</FieldLabel>
            <TextInput
              id="av-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Busy freelance designers"
              autoFocus
            />
          </div>
          <div>
            <FieldLabel htmlFor="av-who">Who they are</FieldLabel>
            <TextArea
              id="av-who"
              rows={2}
              value={draft.who}
              onChange={(e) => setDraft({ ...draft, who: e.target.value })}
              placeholder="e.g. 25–40, work alone from home, juggle many small clients"
            />
          </div>
          <div>
            <FieldLabel htmlFor="av-problem">Their main problem</FieldLabel>
            <TextArea
              id="av-problem"
              rows={2}
              value={draft.problem}
              onChange={(e) => setDraft({ ...draft, problem: e.target.value })}
              placeholder="e.g. Saying yes to every job and having no time left"
            />
          </div>
          <div>
            <FieldLabel htmlFor="av-tone">Tone they like</FieldLabel>
            <TextInput
              id="av-tone"
              value={draft.tone}
              onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
              placeholder="e.g. Friendly, honest, a little funny"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => (audiences.length ? setDraft(null) : onClose())}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} disabled={!draft.name.trim()}>
              Save avatar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {audiences.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-2 rounded-xl border border-line p-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-ink">{a.name}</p>
                  {(a.who || a.problem) && <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">{[a.who, a.problem].filter(Boolean).join(" · ")}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setDraft(a)}
                    aria-label={`Edit ${a.name}`}
                    className="rounded-lg p-2 text-muted hover:bg-gray-100 hover:text-ink"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    aria-label={`Delete ${a.name}`}
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between gap-2">
            <Button icon={<Plus className="size-4" aria-hidden />} onClick={() => setDraft(EMPTY)}>
              New avatar
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
