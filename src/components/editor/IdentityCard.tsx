"use client";

import { useRef, useState } from "react";
import { User } from "lucide-react";
import { brand } from "@/config/brand";
import { BADGE_OPTIONS } from "@/config/options";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, FieldLabel } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/Inputs";
import { ErrorNote } from "@/components/ui/Notice";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { readImageFile } from "@/lib/image";
import type { IdentityApi } from "@/lib/state";
import { ProfilePicker } from "./ProfilePicker";

export function IdentityCard({ identity }: { identity: IdentityApi }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const photo = await readImageFile(file, 400, 0.86);
      if (!identity.updateFields({ photo })) setError("Your browser storage is full. Delete some saved posts, then try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That photo could not be used.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader title="Your identity" className="mb-3" />
      <ProfilePicker identity={identity} />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {identity.photo && (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL
          <img src={identity.photo} alt="Your profile photo" className="size-10 rounded-full object-cover ring-1 ring-line" />
        )}
        <Button icon={<User className="size-4" aria-hidden />} onClick={() => fileRef.current?.click()}>
          {identity.photo ? "Change profile photo" : "Add your profile photo"}
        </Button>
        {identity.photo && (
          <button type="button" onClick={() => identity.updateFields({ photo: null })} className="text-[12.5px] text-muted hover:text-red-600">
            Remove
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Upload profile photo"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      <p className="mt-2 text-[12px] text-muted">Add your real photo. {brand.name} never generates an AI version of your face.</p>
      <ErrorNote className="mt-1">{error}</ErrorNote>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="id-name">Display name</FieldLabel>
          <TextInput
            id="id-name"
            value={identity.name}
            onChange={(e) => identity.updateFields({ name: e.target.value })}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div>
          <FieldLabel htmlFor="id-handle">@username</FieldLabel>
          <TextInput
            id="id-handle"
            value={identity.handle}
            onChange={(e) => identity.updateFields({ handle: e.target.value })}
            placeholder="@yourhandle"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Toggle
          checked={identity.settings.showUsername}
          onChange={(showUsername) => identity.setSettings({ showUsername })}
          label="Show username"
        />
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink/85">Badge</span>
          <Select
            size="sm"
            ariaLabel="Badge"
            className="w-36"
            value={identity.settings.badge}
            options={BADGE_OPTIONS}
            onChange={(badge) => identity.setSettings({ badge })}
          />
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted">The brand badge is a small accent mark, not a platform verification check.</p>
    </Card>
  );
}
