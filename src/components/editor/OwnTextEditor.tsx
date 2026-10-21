"use client";

// MODE 5: "Start with my own text" — the full graphic editor.

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { QUOTE_CARD_IDS, TEMPLATE_MAP } from "@/config/templates";
import type { GraphicData } from "@/components/graphic/types";
import { useAudiences, useBrandVoice, useIdentity } from "@/lib/state";
import { AccentCard } from "./AccentCard";
import { CaptionCard } from "./CaptionCard";
import type { EditorState } from "./editorState";
import { IdentityCard } from "./IdentityCard";
import { LookCard } from "./LookCard";
import { PreviewPanel } from "./PreviewPanel";
import { DarkQuoteCard, ImagesCard, QuoteBrandingCard } from "./StyleCards";
import { StylePicker } from "./StylePicker";
import { TextCard } from "./TextCard";

export function OwnTextEditor({
  state,
  setState,
}: {
  state: EditorState;
  setState: Dispatch<SetStateAction<EditorState>>;
}) {
  const identity = useIdentity();
  const { audiences } = useAudiences();
  const { voice } = useBrandVoice();
  const def = TEMPLATE_MAP[state.templateId];
  const isQuoteCard = QUOTE_CARD_IDS.includes(def.id);

  const patch = useCallback((p: Partial<EditorState>) => setState((s) => ({ ...s, ...p })), [setState]);
  const patchIn = useCallback(
    <K extends "look" | "images" | "darkQuote" | "quote" | "cap">(key: K, p: Partial<EditorState[K]>) =>
      setState((s) => ({ ...s, [key]: { ...s[key], ...p } })),
    [setState],
  );

  const graphic: GraphicData & { templateId: typeof state.templateId } = {
    templateId: state.templateId,
    text: state.text,
    accents: state.accents,
    accentColor: state.accentColor,
    autoLayout: state.autoLayout,
    identity: {
      name: identity.name,
      handle: identity.handle,
      photo: identity.photo,
      showUsername: identity.settings.showUsername,
      badge: identity.settings.badge,
    },
    look: state.look,
    images: state.images,
    darkQuote: state.darkQuote,
    quote: state.quote,
  };

  const audience = audiences.find((a) => a.id === state.audienceId) ?? null;

  return (
    <div className="space-y-4">
      <StylePicker value={state.templateId} onChange={(templateId) => patch({ templateId })} text={state.text} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
        <div className="order-2 min-w-0 space-y-4 md:order-1">
          <TextCard state={state} patch={patch} />

          {def.kind === "darkQuote" && (
            <DarkQuoteCard
              settings={state.darkQuote}
              onChange={(p) => patchIn("darkQuote", p)}
              text={state.text}
              size={state.look.size}
            />
          )}
          {isQuoteCard && (
            <QuoteBrandingCard
              settings={state.quote}
              onChange={(p) => patchIn("quote", p)}
              hasIdentity={Boolean(identity.name.trim() || identity.handle.trim())}
            />
          )}
          {def.images > 0 && <ImagesCard template={def} images={state.images} onChange={(p) => patchIn("images", p)} />}

          {!isQuoteCard && <AccentCard state={state} patch={patch} locked={def.kind === "breakingNews"} />}
          <IdentityCard identity={identity} />
          <LookCard look={state.look} onChange={(p) => patchIn("look", p)} template={def} />
        </div>

        <div className="order-1 md:sticky md:top-4 md:order-2">
          <PreviewPanel data={graphic} caption={state.cap.caption} pinnedComment={state.cap.pinned} />
        </div>
      </div>

      <CaptionCard
        cap={state.cap}
        onChange={(p) => patchIn("cap", p)}
        graphicText={state.text}
        brandVoice={state.useBrandVoice ? voice : ""}
        audience={audience}
      />
    </div>
  );
}
